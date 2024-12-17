import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) { }

    async sendAccountCreatedEmail(
        to: string,
        name: string,
        loginId: string,
        password: string,
        loginUrl: string
    ) {
        return this.mailerService.sendMail({
            to,                         // Recipient email
            subject: 'Your Account Has Been Created', // Email subject
            template: './account-created',  // Template file name
            context: {                  // Data to inject into the template
                name,
                loginId,
                password,
                loginUrl,
            },
        });
    }
}
