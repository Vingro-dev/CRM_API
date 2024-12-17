import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
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

  @Get('attendanceFind/:id')
  async findOne(@Param('id') id: string) {
    return await this.attendanceService.findOne(+id)
  }

  @Get('attendanceHistory/:id')
 async findOneHistory(@Param('id') id: string, @Query('page') page: number, @Query('limit') limit: number
  ) {
    return await this.attendanceService.attendanceHistory(+id, page, limit);
  }

  @Get('DashBoardCounts')
  async getDashboardData() {
    console.log('DashboardCount endpoint called');
    return await this.attendanceService.Dashboarddata();
  }

  @Get('adminAttendanceHistory')
  async getadminattendanceHistory(@Query('filtertype') filtertype: string) {
    console.log(filtertype);

    return this.attendanceService.adminAttendanceHistory(filtertype)
  }


}
