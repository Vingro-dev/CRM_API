import { Module } from '@nestjs/common';
import { MailerServices } from './mailer.service';

@Module({
    providers: [MailerServices],
    exports: [MailerServices], // Export the service so it can be used in other modules
})
export class MailerModule { }
