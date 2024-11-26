import { Controller, Post, Body, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() logindto: LoginDto, body: { email: string; password: string }) {


        const user = await this.authService.validateUser(logindto.email, logindto.password);

        console.log(user);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    // @UseGuards(JwtAuthGuard)
    // @Post('protected')
    // getProtected(@Request() req) {
    //     return { message: 'This is a protected route', user: req.user };
    // }
}
