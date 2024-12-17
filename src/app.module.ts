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
import { UserdesginationModule } from './userdesgination/userdesgination.module';
import { NotificationModule } from './notification/notification.module';
import { Notification } from './notification/entities/notification.entity';
import { Userdesgination } from './userdesgination/entities/userdesgination.entity';
import { CompanymasterModule } from './companymaster/companymaster.module';
import { Companymaster } from './companymaster/entities/companymaster.entity';
import { MailerModule } from '@nestjs-modules/mailer';  // Import the MailerModule
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './utility/Email/mail.service';
import { UserTaskModule } from './user-task/user-task.module';


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
      entities: [User, Attendance, Client, ClientVist, ServicesOffer, Notification, Userdesgination, Companymaster],
      synchronize: true,  // Set to false in production
      autoLoadEntities: true,
      extra: {
        trustServerCertificate: true,  // Disable SSL certificate validation
      },
    }),
    TypeOrmModule.forFeature([User, Attendance, Client, ClientVist, ServicesOffer, Notification, Userdesgination, Companymaster]),
    ClientModule,
    ClientVistModule,
    UsersModule,
    AuthModule,
    ServicesOfferModule,
    DashboardModule,
    AttendanceModule,
    UserdesginationModule,
    NotificationModule,
    CompanymasterModule,



    // Add MailerModule and configure it with SMTP settings
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST, // SMTP server host (e.g., smtp.gmail.com)
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: '"Vingro CRM" <your-email@example.com>',
      },
      template: {
        dir: join(__dirname, '..', 'src', 'utility', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),



    UserTaskModule,
  ],
  controllers: [],
  providers: [MailService],
})
export class AppModule { }
