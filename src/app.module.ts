import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';

// Entities
import { User } from './users/entities/user.entity';
import { UserSession } from './sessions/session.entity';
import { Attendance } from './attendance/entities/attendance.entity';
import { Client } from './client/entities/client.entity';
import { ClientVist } from './client_vist/entities/client_vist.entity';
import { ServicesOffer } from './services_offer/entities/services_offer.entity';
import { Notification } from './notification/entities/notification.entity';
import { Userdesgination } from './userdesgination/entities/userdesgination.entity';
import { Companymaster } from './companymaster/entities/companymaster.entity';

// Modules
import { AttendanceModule } from './attendance/attendance.module';
import { ClientModule } from './client/client.module';
import { ClientVistModule } from './client_vist/client_vist.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ServicesOfferModule } from './services_offer/services_offer.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UserdesginationModule } from './userdesgination/userdesgination.module';
import { NotificationModule } from './notification/notification.module';
import { CompanymasterModule } from './companymaster/companymaster.module';
import { UserTaskModule } from './user-task/user-task.module';

// Middleware & Services
import { SessionMiddleware } from './common/middleware/session.middleware';
import { SessionsService } from './sessions/sessions.service';
import { MailService } from './utility/Email/mail.service';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [

    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      //logging: process.env.DB_LOGGING === 'true',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      ssl: process.env.DB_SSL === 'true',
      extra: {
        trustServerCertificate: true,
        charset: process.env.DB_TYPE === 'mysql' ? 'utf8mb4' : undefined
      },
    }),
    TypeOrmModule.forFeature([
      User, UserSession, Attendance, Client, ClientVist,
      ServicesOffer, Notification, Userdesgination, Companymaster,
    ]),

    // Application Modules
    AttendanceModule,
    ClientModule,
    ClientVistModule,
    UsersModule,
    AuthModule,
    ServicesOfferModule,
    DashboardModule,
    UserdesginationModule,
    NotificationModule,
    CompanymasterModule,
    UserTaskModule,

    // Mailer Module for email functionality
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
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

    ConversationModule,
  ],
  controllers: [],
  providers: [MailService, SessionsService],
  exports: [SessionsService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
