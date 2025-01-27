import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { Between, Repository } from 'typeorm';
import { compareAsc, compareDesc, endOfDay, format, formatDistanceStrict, formatDistanceToNowStrict, startOfDay } from 'date-fns';
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


  async findOne(user_id: number, date: string) {
    const todayStart = startOfDay(new Date(date));
    const todayEnd = endOfDay(new Date(date));

    const existingRecord = await this.attendanceRepository.findOne({
      where: {
        user_id,
        intime: Between(todayStart, todayEnd),
      },
    });

    const currentDate = new Date().toISOString().split('T')[0];

    if (!existingRecord) {
      return {
        status: currentDate === date ? '' : 'Absent',
        formattedIntime: '',
        formattedOuttime: '',
        exactWorkingHours: '',
      };
    }

    // Format intime and outtime
    const formattedIntime = format(new Date(existingRecord.intime), 'dd-MM-yyyy hh:mm a');
    const formattedOuttime = existingRecord.outime ? format(new Date(existingRecord.outime), 'dd-MM-yyyy hh:mm a') : 'null';

    // Calculate working hours
    let exactWorkingHours = '0h 0m 0s';
    if (existingRecord.intime && existingRecord.outime) {
      const start = new Date(existingRecord.intime).getTime();
      const end = new Date(existingRecord.outime).getTime();
      const diff = end - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      exactWorkingHours = `${hours}h ${minutes}m ${seconds}s`;
    }

    // Return attendance record with "Present" status
    return {
      status: 'Present',
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
        return `${response.data.address.suburb} ,${response.data.address.city} ,${response.data.address.state}`; // Human-readable address
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

    // Get all employees
    const allEmployees = await this.userRepository.find({
      where: { role: 'user' },
    });

    // Fetch today's attendance
    const todaysAttendance = await this.attendanceRepository.find({
      where: { created_at: Between(startOfToday, endOfToday) },
      relations: ['user'],
    });

    // Track users who were present today
    const presentEmployees = todaysAttendance.map((entry) => entry.user.user_id);

    // Track employees with late punches
    const latePunchEmployees = todaysAttendance.filter((entry) => {
      const checkInTime = new Date(entry.intime);
      return checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30);
    }).map((entry) => entry.user.user_id);




    const halfDayEmployees = todaysAttendance
      .filter((entry) => {
        const checkInTime = new Date(entry.intime);
        const checkOutTime = entry.outime ? new Date(entry.outime) : null;

        // Convert times to the desired timezone
        const localCheckInTime = checkInTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        const localCheckOutTime = checkOutTime ? checkOutTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : null;

        console.log(localCheckInTime, localCheckOutTime, 'Check-in and Check-out Time');

        // Auto half-day: No check-out and check-in between 2:00 PM - 6:00 PM
        if (!checkOutTime) {
          const autoHalfDay = checkInTime.getHours() >= 14 && checkInTime.getHours() < 18;
          if (autoHalfDay) {
            console.log('User auto half-day, user_id:', entry.user.user_id);
            return true;
          }
          return false;
        }

        // Full-day condition
        const workedHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        const fullDayCondition =
          checkInTime.getHours() <= 9 &&
          checkInTime.getMinutes() <= 30 &&
          checkOutTime.getHours() >= 18 &&
          checkOutTime.getMinutes() >= 30;

        if (fullDayCondition || workedHours >= 8) {
          console.log('Full-day employee, user_id:', entry.user.user_id);
          return false;
        }

        // Check-out after 2:30 PM disqualifies half-day
        if (checkOutTime.getHours() > 14 || (checkOutTime.getHours() === 14 && checkOutTime.getMinutes() > 30)) {
          console.log('User check-out after 2:30 PM, not eligible for half-day, user_id:', entry.user.user_id);
          return false;
        }

        // Morning Half-Day: Relaxed condition
        const morningHalfDay =
          checkInTime.getHours() < 14 && // Check-in before 2:00 PM
          (checkOutTime.getHours() < 14 || (checkOutTime.getHours() === 14 && checkOutTime.getMinutes() <= 30)); // Check-out before or at 2:30 PM

        const autoHalfDay = checkInTime.getHours() >= 14 && checkInTime.getHours() < 18;

        console.log({
          userId: entry.user.user_id,
          checkInTime: localCheckInTime,
          checkOutTime: localCheckOutTime,
          isMorningHalfDay: morningHalfDay,
          isAutoHalfDay: autoHalfDay,
        });

        return morningHalfDay || autoHalfDay;
      })
      .map((entry) => entry.user.user_id);

    console.log(halfDayEmployees, 'Half-Day Employees');










    // Track absent employees
    const absentEmployees = allEmployees
      .filter((employee) => !presentEmployees.includes(employee.user_id))
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

    // Categorizing attendance data
    const presentEmployees = todaysAttendance.map((entry) => entry.user.user_id);

    const latePunchEmployees = todaysAttendance.filter((entry) => {
      const checkInTime = new Date(entry.intime);
      return checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30);
    }).map((entry) => entry.user.user_id);

    // const halfDayEmployees = todaysAttendance
    //   .filter((entry) => {
    //     const checkInTime = new Date(entry.intime);  // Assuming this is UTC
    //     const checkOutTime = entry.outime ? new Date(entry.outime) : null;  // Assuming this is UTC
    //     const localCheckInTime = checkInTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    //     const localCheckOutTime = checkOutTime ? checkOutTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : null;

    //     if (!checkOutTime) {
    //       const autoHalfDay = checkInTime.getHours() >= 14 && checkInTime.getHours() < 18;
    //       if (autoHalfDay) {
    //         return true;
    //       }
    //       return false;
    //     }

    //     const workedHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    //     const fullDayCondition =
    //       checkInTime.getHours() <= 9 &&
    //       checkInTime.getMinutes() <= 30 &&
    //       checkOutTime.getHours() >= 18 &&
    //       checkOutTime.getMinutes() >= 30;

    //     if (fullDayCondition || workedHours >= 8) return false;

    //     const morningHalfDay =
    //       (checkInTime.getHours() < 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() <= 30)) &&
    //       (checkOutTime.getHours() < 14 || (checkOutTime.getHours() === 14 && checkOutTime.getMinutes() === 0));

    //     const autoHalfDay = checkInTime.getHours() >= 14 && checkInTime.getHours() < 18;

    //     if (morningHalfDay || autoHalfDay) {
    //       return true;
    //     }

    //     return false;
    //   })
    //   .map((entry) => entry.user.user_id);



    const halfDayEmployees = todaysAttendance
      .filter((entry) => {
        const checkInTime = new Date(entry.intime);
        const checkOutTime = entry.outime ? new Date(entry.outime) : null;

        // Convert times to the desired timezone
        const localCheckInTime = checkInTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        const localCheckOutTime = checkOutTime ? checkOutTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : null;

        console.log(localCheckInTime, localCheckOutTime, 'Check-in and Check-out Time');

        // Auto half-day: No check-out and check-in between 2:00 PM - 6:00 PM
        if (!checkOutTime) {
          const autoHalfDay = checkInTime.getHours() >= 14 && checkInTime.getHours() < 18;
          if (autoHalfDay) {
            console.log('User auto half-day, user_id:', entry.user.user_id);
            return true;
          }
          return false;
        }

        // Full-day condition
        const workedHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        const fullDayCondition =
          checkInTime.getHours() <= 9 &&
          checkInTime.getMinutes() <= 30 &&
          checkOutTime.getHours() >= 18 &&
          checkOutTime.getMinutes() >= 30;

        if (fullDayCondition || workedHours >= 8) {
          console.log('Full-day employee, user_id:', entry.user.user_id);
          return false;
        }

        // Check-out after 2:30 PM disqualifies half-day
        if (checkOutTime.getHours() > 14 || (checkOutTime.getHours() === 14 && checkOutTime.getMinutes() > 30)) {
          console.log('User check-out after 2:30 PM, not eligible for half-day, user_id:', entry.user.user_id);
          return false;
        }

        // Morning Half-Day: Relaxed condition
        const morningHalfDay =
          checkInTime.getHours() < 14 && // Check-in before 2:00 PM
          (checkOutTime.getHours() < 14 || (checkOutTime.getHours() === 14 && checkOutTime.getMinutes() <= 30)); // Check-out before or at 2:30 PM

        const autoHalfDay = checkInTime.getHours() >= 14 && checkInTime.getHours() < 18;

        return morningHalfDay || autoHalfDay;
      })
      .map((entry) => entry.user.user_id);

    const absentEmployees = allEmployees.filter((employee) => !presentEmployees.includes(employee.user_id)).map((employee) => employee.user_id);

    // Function to return employee details with formatted times and late time
    const getEmployeeDetails = async (userId: number) => {
      const employee = allEmployees.find(emp => emp.user_id === userId);
      const attendanceEntry = todaysAttendance.find(entry => entry.user.user_id === userId);

      if (!employee) return null;

      let intime = null, outime = null, lateTime = null, locationName = null;

      if (attendanceEntry) {
        intime = new Date(attendanceEntry.intime);
        outime = attendanceEntry.outime ? new Date(attendanceEntry.outime) : null;

        // Calculate late time
        const checkInTime = new Date(intime);
        const referenceTime = new Date(checkInTime);
        referenceTime.setHours(9, 30, 0, 0);

        if (checkInTime > referenceTime) {
          const lateDifferenceInMillis = checkInTime.getTime() - referenceTime.getTime();
          const lateHours = Math.floor(lateDifferenceInMillis / (1000 * 60 * 60));
          const lateMinutes = Math.floor((lateDifferenceInMillis % (1000 * 60 * 60)) / (1000 * 60));
          lateTime = `${lateHours}h ${lateMinutes} m`;
        }


        console.log(attendanceEntry.latitude, attendanceEntry.longitude, 'attendanceEntry.latitude');

        if (attendanceEntry.latitude && attendanceEntry.longitude) {
          locationName = await this.getLocationName(attendanceEntry.latitude, attendanceEntry.longitude);
        }
      }

      if (attendanceEntry) {
        return {
          userId: employee.user_id,
          name: employee.name,
          designation: employee.designation.DesginationName,
          intime: intime ? format(intime, 'h:mm a') : null,
          outime: outime ? format(outime, 'h:mm a') : null,
          lateTime: lateTime || null,
          profile: employee.profile,
          locationName: locationName
        };
      } else {
        return {
          name: employee.name,
          designation: employee.designation.DesginationName,
          intime: null,
          outime: null,
          lateTime: null,
          locationName: null
        };
      }
    };

    // Get employee details based on filter type
    let filteredEmployees: any[] = [];
    const filter = filtertype.toLowerCase();
    switch (filter) {
      case 'present':
        filteredEmployees = await Promise.all(presentEmployees.map(userId => getEmployeeDetails(userId)));
        break;
      case 'late':
        filteredEmployees = await Promise.all(latePunchEmployees.map(userId => getEmployeeDetails(userId)));
        break;
      case 'halfday':
        filteredEmployees = await Promise.all(halfDayEmployees.map(userId => getEmployeeDetails(userId)));
        break;
      case 'absent':
        filteredEmployees = await Promise.all(absentEmployees.map(userId => getEmployeeDetails(userId)));
        break;
      default:
        filteredEmployees = [];
    }

    return filteredEmployees.filter(details => details !== null);
  }




}