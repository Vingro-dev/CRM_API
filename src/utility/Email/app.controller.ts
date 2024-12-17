import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class AppController {
    constructor(private readonly mailService: MailService) { }
    @Post('send-account-created')
    async sendAccountCreatedEmail(@Body() body: { to: string; name: string; loginId: string; password: string }) {
        const { to, name, loginId, password } = body;


        console.log(to, name, loginId, password);

        const loginUrl = 'https://your-app-login-url.com';
        await this.mailService.sendAccountCreatedEmail(to, name, loginId, password, loginUrl);
        return { message: 'Account creation email sent successfully!' };
    }
}
