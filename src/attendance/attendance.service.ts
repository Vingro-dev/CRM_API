import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { Between, Repository } from 'typeorm';
import { endOfDay, format, startOfDay } from 'date-fns';
import axios from "axios";
import { User } from 'src/users/entities/user.entity';




@Injectable()

export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }


  async checkIn(createAttendanceDto: any) {
    const { user_id, intime, latitude, longitude, uniqueid } = createAttendanceDto;

    // Convert intime to a Date object
    const intimeDate = new Date(intime);

    if (isNaN(intimeDate.getTime())) {
      throw new BadRequestException('Invalid intime format. Please provide a valid date.');
    }

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    // Check for existing attendance record
    const existingRecord = await this.attendanceRepository.findOne({
      where: {
        user_id,
        intime: Between(todayStart, todayEnd),
      },
    });

    if (existingRecord && !existingRecord.outime) {
      throw new BadRequestException('You must check out before checking in again.');
    }

    if (existingRecord) {
      throw new BadRequestException('You have already checked in for today.');
    }

    let lateTime = null;

    // Calculate late hours
    const checkInTime = new Date(intimeDate);
    const referenceTime = new Date(checkInTime);
    referenceTime.setHours(9, 30, 0, 0);  // Set to 9:30 AM

    // Calculate the late time difference if checkInTime is after 9:30 AM
    if (checkInTime > referenceTime) {
      const lateDifferenceInMillis = checkInTime.getTime() - referenceTime.getTime();  // Difference in ms
      const lateHours = Math.floor(lateDifferenceInMillis / (1000 * 60 * 60));  // Get hours
      const lateMinutes = Math.floor((lateDifferenceInMillis % (1000 * 60 * 60)) / (1000 * 60));  // Get minutes
      lateTime = `${lateHours}h ${lateMinutes}m`;
    }


    let halfDay = false;
    const checkInHour = checkInTime.getHours();
    const checkInMinute = checkInTime.getMinutes();
    let checkOutTime: Date;

    if (existingRecord) {
      checkOutTime = new Date(existingRecord.outime); // Existing outtime for half-day check
    } else {
      // For the purpose of half-day logic, assume the user works 4 hours from the check-in time
      checkOutTime = new Date(checkInTime.getTime() + 4 * 60 * 60 * 1000); // Assuming 4 hours of work
    }

    const workedHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60); // Worked hours

    // Morning half-day: Check-in after 9:30 AM and leave before 2:00 PM
    const morningHalfDay = checkInHour >= 9 && checkInMinute >= 30 && checkOutTime.getHours() < 14;

    // Evening half-day: Check-in after 2:00 PM and leave before 6:30 PM
    const eveningHalfDay = checkInHour >= 14 && checkOutTime.getHours() <= 18;

    // If user worked between 2 and 4 hours and qualifies as morning or evening half-day
    if ((morningHalfDay || eveningHalfDay) && workedHours >= 2 && workedHours <= 4) {
      halfDay = true;
    }

    console.log(lateTime);

    // Create a new attendance record
    const newAttendance = this.attendanceRepository.create({
      user_id,
      intime: intimeDate, // Ensure this is a valid Date object
      latitude,
      longitude,
      DeviceID: uniqueid,
      late_hours: lateTime,
      half_day: halfDay, // Default value
    });

    const savedAttendance = await this.attendanceRepository.save(newAttendance);

    return {
      ...savedAttendance,
      formattedIntime: format(intimeDate, 'yyyy-MM-dd hh:mm a'), // Return formatted intime
    };
  }



  async checkOut(user_id: number, checkOutData: any) {

    const { Outtime, latitude, longitude, uniqueid } = checkOutData

    console.log(checkOutData, "checkOutData");


    const attendance = await this.attendanceRepository.findOne({
      where: { user_id, outime: null },
      order: { intime: 'DESC' },
    });

    if (!attendance) {
      throw new Error('No active check-in record found. Please check in first.');
    }

    if (attendance.DeviceID !== uniqueid) {
      throw new Error('Check-out must be performed on the same device as check-in.');
    }

    attendance.outime = Outtime

    const start = new Date(attendance.intime).getTime();
    const end = new Date(checkOutData.outime).getTime();
    const diffInMillis = end - start;

    attendance.total_hours = Math.round((diffInMillis / (1000 * 60 * 60)) * 100) / 100;

    return this.attendanceRepository.save(attendance);
  }


  async findOne(user_id: number) {
    const todayStart = startOfDay(new Date()); // Start of current day
    const todayEnd = endOfDay(new Date());    // End of current day

    const existingRecord = await this.attendanceRepository.findOne({
      where: {
        user_id,
        intime: Between(todayStart, todayEnd),
      },
    });


    if (!existingRecord) {
      throw new NotFoundException('No attendance record found for today.');
    }

    const formattedIntime = format(new Date(existingRecord.intime), 'dd-MM-yyyy hh:mm a');
    const formattedOuttime = existingRecord.outime ? format(new Date(existingRecord.outime), 'dd-MM-yyyy hh:mm a') : existingRecord.outime;
    let exactWorkingHours = '0h 0m';
    if (existingRecord.intime && existingRecord.outime) {
      const start = new Date(existingRecord.intime).getTime();
      const end = new Date(existingRecord.outime).getTime();
      const diff = end - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      exactWorkingHours = `${hours}h ${minutes}m ${seconds}s`;
    }

    return {
      ...existingRecord,
      formattedIntime,
      formattedOuttime,
      exactWorkingHours,
    };
  }


  async attendanceHistory(user_id: number, page: number = 1, limit: number = 10) {

    const offset = (page - 1) * limit;

    // Fetch the paginated attendance data
    const [attendanceData, total] = await this.attendanceRepository.findAndCount({
      where: { user_id },
      order: { att_id: 'DESC' }, // Order by attendance ID descending
      skip: offset, // Skip records based on page number
      take: limit, // Limit the number of records per page
    });

    // Enrich data with location names and formatted times
    const enrichedData = await Promise.all(
      attendanceData.map(async (record) => {
        let locationName = null;
        if (record.latitude && record.longitude) {
          locationName = await this.getLocationName(record.latitude, record.longitude);
        }

        const formattedIntime = record.intime ? format(new Date(record.intime), 'h:mm a') : null; // e.g., 9:30 AM
        const formattedOutime = record.outime ? format(new Date(record.outime), 'h:mm a') : null; // e.g., 6:40 PM

        // Format attendance date
        const formattedDate = record.created_at ? format(new Date(record.created_at), 'MMM d, yyyy') : null; // e.g., Mar 8, 2002

        return {
          att_id: record.att_id,
          user_id: record.user_id,
          intime: formattedIntime,
          outime: formattedOutime,
          attendance_date: formattedDate,
          location_name: locationName,
          total_hours: record.total_hours,
          DeviceID: record.DeviceID,
        };
      })
    );


    return {
      data: enrichedData,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }


  async getLocationName(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      if (response.data && response.data.display_name) {
        return response.data.display_name; // Human-readable address
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
      return null;
    }
  }




  async Dashboarddata() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Get all employees (users with 'user' role)
    const allEmployees = await this.userRepository.find({
      where: { role: 'user' },
    });

    console.log('Number of employees:', allEmployees.length);

    // Fetch today's attendance
    const todaysAttendance = await this.attendanceRepository.find({
      where: {
        created_at: Between(startOfToday, endOfToday),
      },
      relations: ['user'], // Assuming 'user' relation exists for attendance
    });

    console.log('Today\'s attendance records:', todaysAttendance.length);

    // if (todaysAttendance.length === 0) {
    //   throw new NotFoundException('No attendance record found for today.');
    // }

    // Track users who were present today
    const presentEmployees = todaysAttendance.map((entry) => entry.user.user_id);

    // Track employees with late punches
    const latePunchEmployees = todaysAttendance.filter((entry) => {
      const checkInTime = new Date(entry.intime);
      return checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30);
    }).map((entry) => entry.user.user_id);

    // Track employees who are on half-day (morning or evening)
    const halfDayEmployees = todaysAttendance.filter((entry) => {
      const checkInTime = new Date(entry.intime);
      let checkOutTime = new Date(entry.outime);

      // Handle cases where outime is NULL (user hasn't checked out)
      if (!checkOutTime.getTime()) {
        // Assuming the user worked 2 hours if outime is NULL (you can adjust this logic)
        checkOutTime = new Date(checkInTime.getTime() + 2 * 60 * 60 * 1000); // Assuming 2 hours worked
      }

      // Calculate the total worked hours
      const workedHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60); // Convert ms to hours

      // Morning half-day logic: Check-in after 9:30 AM and leave before 2:00 PM (worked hours should be between 2 and 4 hours)
      const morningHalfDay = checkInTime.getHours() >= 9 && checkInTime.getMinutes() >= 30 && checkOutTime.getHours() < 14;

      // Evening half-day logic: Check-in after 2:00 PM and leave before 6:30 PM (worked hours should be between 2 and 4 hours)
      const eveningHalfDay = checkInTime.getHours() >= 14 && checkOutTime.getHours() <= 18;

      // Half-day if worked between 2 and 4 hours and either morning or evening half-day
      return (morningHalfDay || eveningHalfDay) && workedHours >= 2 && workedHours <= 4;
    }).map((entry) => entry.user.user_id);

    // Track absent employees (those who didn't record attendance today)
    const absentEmployees = allEmployees.filter((employee) => !presentEmployees.includes(employee.user_id))
      .map((employee) => employee.user_id);

    return {
      totalEmployees: allEmployees.length,
      present: presentEmployees.length,
      absent: absentEmployees.length,
      latePunch: latePunchEmployees.length,
      halfDay: halfDayEmployees.length,
    };
  }




  async adminAttendanceHistory(filtertype: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Get all employees
    const allEmployees = await this.userRepository.find({
      where: { role: 'user' },
    });

    // Fetch today's attendance records
    const todaysAttendance = await this.attendanceRepository.find({
      where: {
        created_at: Between(startOfToday, endOfToday),
      },
      relations: ['user'],
    });

    // If there are no attendance records today, return an empty array
    // if (todaysAttendance.length === 0) {
    //   return [];
    // }

    // Categorizing attendance data
    const presentEmployees = todaysAttendance.map((entry) => entry.user.user_id);

    const latePunchEmployees = todaysAttendance.filter((entry) => {
      const checkInTime = new Date(entry.intime);
      return checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30);
    }).map((entry) => entry.user.user_id);



    const halfDayEmployees = todaysAttendance.filter((entry) => {
      const checkInTime = new Date(entry.intime);
      let checkOutTime = new Date(entry.outime);

      // Handle cases where outime is NULL (user hasn't checked out)
      if (!checkOutTime.getTime()) {
        // Assuming the user worked 2 hours if outime is NULL (you can adjust this logic)
        checkOutTime = new Date(checkInTime.getTime() + 2 * 60 * 60 * 1000); // Assuming 2 hours worked
      }

      // Calculate the total worked hours
      const workedHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60); // Convert ms to hours

      // Morning half-day logic: Check-in after 9:30 AM and leave before 2:00 PM (worked hours should be between 2 and 4 hours)
      const morningHalfDay = checkInTime.getHours() >= 9 && checkInTime.getMinutes() >= 30 && checkOutTime.getHours() < 14;

      // Evening half-day logic: Check-in after 2:00 PM and leave before 6:30 PM (worked hours should be between 2 and 4 hours)
      const eveningHalfDay = checkInTime.getHours() >= 14 && checkOutTime.getHours() <= 18;

      // Half-day if worked between 2 and 4 hours and either morning or evening half-day
      return (morningHalfDay || eveningHalfDay) && workedHours >= 2 && workedHours <= 4;
    }).map((entry) => entry.user.user_id);


    // const halfDayEmployees = todaysAttendance.filter((entry) => {
    //   const checkInTime = new Date(entry.intime);
    //   const checkOutTime = new Date(entry.outime);
    //   const workedHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60); // Convert ms to hours
    //   return workedHours >= 2 && workedHours <= 4;
    // }).map((entry) => entry.user.user_id);

    const absentEmployees = allEmployees.filter((employee) => !presentEmployees.includes(employee.user_id)).map((employee) => employee.user_id);

    // Function to return employee details with formatted times and late time
    const getEmployeeDetails = (userId: number) => {
      const employee = allEmployees.find(emp => emp.user_id === userId);
      const attendanceEntry = todaysAttendance.find(entry => entry.user.user_id === userId);



      if (!employee) return null; // If employee doesn't exist, return null

      let intime = null, outime = null, lateTime = null;

      if (attendanceEntry) {
        intime = new Date(attendanceEntry.intime);
        outime = attendanceEntry.outime ? new Date(attendanceEntry.outime) : null;

        // Calculate late time
        const checkInTime = new Date(intime);  // Create a copy of intime
        const referenceTime = new Date(checkInTime);
        referenceTime.setHours(9, 30, 0, 0);  // Set to 9:30 AM

        // Calculate the late time difference if checkInTime is after 9:30 AM
        if (checkInTime > referenceTime) {
          const lateDifferenceInMillis = checkInTime.getTime() - referenceTime.getTime();  // Difference in ms
          const lateHours = Math.floor(lateDifferenceInMillis / (1000 * 60 * 60));  // Get hours
          const lateMinutes = Math.floor((lateDifferenceInMillis % (1000 * 60 * 60)) / (1000 * 60));  // Get minutes
          lateTime = `${lateHours}h ${lateMinutes}m`;
        }
      }

      if (attendanceEntry) {
        // Return the details

        return {
          userId: employee.user_id,
          name: employee.name,
          designation: employee.designation.DesginationName,
          intime: intime ? format(intime, 'h:mm a') : null,
          outime: outime ? format(outime, 'h:mm a') : null,
          lateTime: lateTime || null,
          profile: employee.profile,
        };
      } else {


        // If no attendance entry, employee is absent
        return {
          name: employee.name,
          designation: employee.designation.DesginationName,
          intime: null,
          outime: null,
          lateTime: null,
        };
      }
    };

    // Get employee details based on filter type
    let filteredEmployees: any[] = [];
    const filter = filtertype.toLowerCase()
    switch (filter) {
      case 'present':
        filteredEmployees = presentEmployees.map(userId => getEmployeeDetails(userId)).filter(details => details !== null);
        break;
      case 'late':
        filteredEmployees = latePunchEmployees.map(userId => getEmployeeDetails(userId)).filter(details => details !== null);
        break;
      case 'halfday':
        filteredEmployees = halfDayEmployees.map(userId => getEmployeeDetails(userId)).filter(details => details !== null);
        break;
      case 'absent':
        filteredEmployees = absentEmployees.map(userId => getEmployeeDetails(userId)).filter(details => details !== null);
        break;
      default:
        filteredEmployees = [];  // Return an empty array if the filter type is unknown
    }

    return filteredEmployees;
  }



}