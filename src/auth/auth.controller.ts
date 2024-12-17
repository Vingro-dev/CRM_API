import { Controller, Post, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/ResetPassword.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // User Login
    @Post('login')
    async login(@Body() logindto: LoginDto) {
        const user = await this.authService.validateUser(logindto.email, logindto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    // Send OTP to user email
    @Post('send-otp')
    async sendOtp(@Body() logindto: LoginDto) {


        console.log(logindto);

        const { email } = logindto;
        const otp = await this.authService.sendOtp(email);
        return { message: 'OTP sent to your email', otp };
    }

    // Verify OTP
    @Post('verify-otp')
    async verifyOtp(@Body() logindto: any) {
        const { email, otp } = logindto;

        console.log(email, otp);

        const isOtpVerified = await this.authService.verifyOtp(email, otp);

        console.log(isOtpVerified);


        if (isOtpVerified) {
            return { message: 'OTP verified. You can reset your password.' };
        }
    }

    // Reset Password
    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {


        console.log(resetPasswordDto, 'reset password');

        if (!resetPasswordDto.password) {
            throw new BadRequestException('Password is required');
        }
        return this.authService.resetPassword(resetPasswordDto.email, resetPasswordDto.password);
    }
}
