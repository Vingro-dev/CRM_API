import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';


@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }
    
    @Get(':id')
    async DashboardData(@Param('id') id: string) {
        console.log(id, 'id');
        return this.dashboardService.getDashboardCount(id);
    }


}

