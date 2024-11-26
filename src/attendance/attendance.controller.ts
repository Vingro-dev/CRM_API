import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Post("checkIn")
  create(@Body() createAttendanceDto: any) {
    return this.attendanceService.checkIn(createAttendanceDto);
  }

  @Patch('checkout/:id')
  update(@Param('id') id: any, @Body() checkOutData: any) {
    return this.attendanceService.checkOut(+id, checkOutData);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(+id)
  }



}
