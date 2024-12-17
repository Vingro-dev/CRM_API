import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerServices {


    constructor(
        private readonly mailerService: MailerService
    ) { }

    async sendOtpEmail(email: string, otp: string) {
        const mailOptions = {
            to: email,
            subject: 'Your OTP for Password Reset',
            template: 'otp-verifyed',
            context: {
                name: '',
                otp: otp,
                year: new Date().getFullYear(),
            },
        };

        return this.mailerService.sendMail(mailOptions);
    }
}
