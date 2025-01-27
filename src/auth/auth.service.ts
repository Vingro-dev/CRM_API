import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import * as crypto from 'crypto';
import { MailerServices } from 'src/mailer/mailer.service';
import { format, isEqual } from 'date-fns';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from 'src/sessions/session.entity';

@Injectable()
export class AuthService {
    private otpCache = new Map<string, { otp: string; expiresAt: number }>();

    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private mailerService: MailerServices,
        @InjectRepository(UserSession)
        private userSessionRepository: Repository<UserSession>,
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

    async sendOtp(email: string, dob: Date): Promise<string> {

        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const userDobFormatted = format(new Date(user.DOB), 'yyyy-MM-dd');
        const inputDobFormatted = format(new Date(dob), 'yyyy-MM-dd');

        console.log(userDobFormatted, inputDobFormatted);

        const isDobValid = isEqual(userDobFormatted, inputDobFormatted)

        if (!isDobValid) {
            throw new UnauthorizedException('Date of Birth does not match');
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000;


        this.otpCache.set(email, { otp, expiresAt });

        console.log(`OTP for ${email} cached:`, { otp, expiresAt });


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


    async login(user: any, deviceId: string, deviceInfo: object) {
        // Generate JWT token
        const payload = { username: user.name, sub: user.user_id };

        const token = this.jwtService.sign(payload);

        const designation = user.designation.DesginationName;

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        //const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 1 minute from now

        const session = new UserSession();
        session.user_id = user.user_id;
        session.token = token;
        session.deviceId = deviceId;
        session.deviceInfo = JSON.stringify(deviceInfo);
        session.expiresAt = expiresAt;

        await this.userSessionRepository.save(session);



        return {
            access_token: token,
            userData: {
                userid: user.user_id,
                username: user.name,
                email: user.email,
                role: user.role,
                designation,
                profile:user.profile
            },
        };
    }

}
