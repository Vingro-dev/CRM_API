import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import * as crypto from 'crypto';
import { MailerServices } from 'src/mailer/mailer.service';  // You will need a mail service to send the OTP

@Injectable()
export class AuthService {
    private otpCache = new Map<string, { otp: string; expiresAt: number }>();

    constructor(
        private userService: UsersService,  // Inject UserService to access user data
        private jwtService: JwtService,
        private mailerService: MailerServices, // Inject mail service to send OTP emails
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new UnauthorizedException('Your account is inactive. Please contact admin to login.');
        }
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async sendOtp(email: string): Promise<string> {
        const otp = crypto.randomInt(100000, 999999).toString();  // Generate 6 digit OTP
        const expiresAt = Date.now() + 5 * 60 * 1000;

        // Cache the OTP for verification
        this.otpCache.set(email, { otp, expiresAt });

        console.log(`OTP for ${email} cached:`, { otp, expiresAt });  // Log OTP to verify

        // Send OTP email to the user
        await this.mailerService.sendOtpEmail(email, otp);

        return otp;
    }


    async verifyOtp(email: string, otp: string): Promise<boolean> {
        const cachedOtp = this.otpCache.get(email);

        console.log(`Verifying OTP for ${email}:`, { enteredOtp: otp, cachedOtp }); // Detailed log

        if (!cachedOtp) {
            throw new BadRequestException('OTP not requested or expired');
        }

        if (Date.now() > cachedOtp.expiresAt) {
            this.otpCache.delete(email);
            throw new BadRequestException('OTP has expired');
        }

        if (cachedOtp.otp === otp) {
            this.otpCache.delete(email);
            return true;
        } else {
            throw new BadRequestException('Invalid OTP');
        }
    }


    async resetPassword(email: string, password: string): Promise<any> {
        if (!password) {
            console.log('Password is undefined or empty');
        }
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await this.userService.updatePassword(email, hashedPassword);
        return { message: 'Password successfully reset' };
    }


    async login(user: any) {
        const designation = user.designation.DesginationName;
        const payload = { username: user.name, sub: user.user_id };
        return {
            access_token: this.jwtService.sign(payload),
            userData: { userid: user.user_id, username: user.name, email: user.email, role: user.role, profile: user.profile, designation }
        };
    }
}
