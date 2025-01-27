import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import * as XLSX from 'xlsx';
import { Response } from 'express';
import { format } from 'date-fns';  // Import format from date-fns

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

  @Get('attendanceFind/:userId/:date')
  async findAttendanceByDate(@Param('userId') userId: string, @Param('date') date: string
  ) {
    return await this.attendanceService.findOne(+userId, date);
  }

  @Get('attendanceHistory/:id')
  async findOneHistory(@Param('id') id: string, @Query('page') page: number, @Query('limit') limit: number) {
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
    return this.attendanceService.adminAttendanceHistory(filtertype);
  }

  @Get('MonthlyAttendanceReport')
  async exportXLS(@Res() res: Response) {
    // Step 1: Prepare the data in Array of Arrays (AOA) format
    const headerTitle = [['Employee Attendance Report']]; // Top header
    const tableHeader = [['First Name', 'Last Name', 'Email']]; // Column headers
    const tableData = [
      ['Jack', 'Sparrow', 'abc@example.com'],
      ['Harry', 'Potter', 'abc@example.com'],
    ];
    const footer = [[`Generated on: ${new Date().toLocaleString()}`]]; // Footer text

    // Combine all parts into one AOA (header title, table, and footer)
    const fullData: any[][] = [
      ...headerTitle, // Add header
      [], // Empty row for spacing
      ...tableHeader, // Add table header
      ...tableData, // Add table data
      [], // Empty row for spacing
      ...footer, // Add footer
    ];

    // Step 2: Create a worksheet from the full data
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(fullData);

    // Step 3: Merge header and footer cells across all columns
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Merge "Employee Attendance Report" (Header)
      { s: { r: fullData.length - 1, c: 0 }, e: { r: fullData.length - 1, c: 2 } }, // Merge footer row
    ];

    // Step 4: Apply custom styles manually (for merged header and footer)
    ws['A1'].s = {
      font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { fgColor: { rgb: '4F81BD' } }, // Header background color
    };

    const footerCellAddress = XLSX.utils.encode_cell({ r: fullData.length - 1, c: 0 });
    ws[footerCellAddress].s = {
      font: { italic: true, sz: 10 },
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { fgColor: { rgb: 'E0E0E0' } }, // Footer background color
    };

    // Step 5: Style the table headers and data
    const range = XLSX.utils.decode_range(ws['!ref'] || '');
    for (let R = 2; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
          font: { bold: R === 2, color: { rgb: R === 2 ? 'FFFFFF' : '000000' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          fill: R === 2 ? { fgColor: { rgb: '5B9BD5' } } : {},
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
          },
        };
      }
    }

    // Step 6: Create the workbook and append the worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');

    // Step 7: Generate the file as a buffer
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Step 8: Set response headers to trigger a file download
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${currentDate}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.send(buffer);
  }



}
