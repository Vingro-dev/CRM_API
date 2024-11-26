import { Module } from '@nestjs/common';
import { AttendanceModule } from './attendance/attendance.module';
import { ClientModule } from './client/client.module';
import { ClientVistModule } from './client_vist/client_vist.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './attendance/entities/attendance.entity';
import { Client } from './client/entities/client.entity';
import { ClientVist } from './client_vist/entities/client_vist.entity';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { ServicesOfferModule } from './services_offer/services_offer.module';
import { ServicesOffer } from './services_offer/entities/services_offer.entity';
import { DashboardModule } from './dashboard/dashboard.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 1433, // Default port 1433 if not set
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Attendance, Client, ClientVist, ServicesOffer],
      synchronize: true,  // Set to false in production
      autoLoadEntities: true,
      extra: {
        trustServerCertificate: true,  // Disable SSL certificate validation
      },
    }),
    TypeOrmModule.forFeature([User, Attendance, Client, ClientVist, ServicesOffer]),
    ClientModule,
    ClientVistModule,
    UsersModule,
    AuthModule,
    ServicesOfferModule,
    DashboardModule,
    AttendanceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
