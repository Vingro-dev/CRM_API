import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { Between, Repository } from 'typeorm';
import { endOfDay, format, startOfDay } from 'date-fns';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) { }

  async checkIn(createAttendanceDto: any) {

    const { user_id, intime, latitude, longitude, uniqueid } = createAttendanceDto;


    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

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

    // Create a new attendance record
    const newAttendance = this.attendanceRepository.create({
      user_id,
      intime,
      latitude,
      longitude,
      DeviceID: uniqueid,
    });

    const savedAttendance = await this.attendanceRepository.save(newAttendance);

    const formattedIntime = format(new Date(savedAttendance.intime), 'yyyy-MM-dd hh:mm a');

   
    return {
      ...savedAttendance,
      formattedIntime,
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


  findAll() {
    return this.attendanceRepository.find();
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
}
