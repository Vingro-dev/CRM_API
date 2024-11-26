import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientVist } from 'src/client_vist/entities/client_vist.entity';
import { DashboardService } from './dashboard.service';
import { Client } from 'src/client/entities/client.entity';

@Module({

  imports: [TypeOrmModule.forFeature([ClientVist, Client])],
  providers: [DashboardService],
  controllers: [DashboardController]
})
export class DashboardModule { }


