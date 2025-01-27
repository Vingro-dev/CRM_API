import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SessionsService } from 'src/sessions/sessions.service';
import * as jwt from 'jsonwebtoken'; // Required to decode JWT
import { JwtPayload } from 'jsonwebtoken'; // Import JwtPayload to type the decoded token

@Injectable()
export class SessionMiddleware implements NestMiddleware {
    constructor(private sessionsService: SessionsService) { }

    async use(req: Request, res: Response, next: NextFunction) {

        //console.log('Headers:', req.headers);


        const token = req.get('authorization')?.split(' ')[1]; // Extract the token from Authorization header
        const deviceId = req.get('device-id'); // Extract the device-id

        // If no token or deviceId are found, allow login (this is for the first login)
        if (!token || !deviceId) {
            return next();
        }

        // Validate JWT token expiration
        try {
            // Decode the JWT token
            const decoded = jwt.decode(token) as JwtPayload; // Cast to JwtPayload

            if (decoded && decoded.exp) {
                const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
                if (decoded.exp < currentTime) {
                    throw new UnauthorizedException('JWT token has expired');
                }
            } else {
                throw new UnauthorizedException('Invalid JWT token');
            }
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired JWT token');
        }

        // Validate session expiration
        const session = await this.sessionsService.findSessionByTokenAndDevice(token, deviceId);
        if (!session) {
            throw new UnauthorizedException('Invalid session');
        }

        // Check if session has expired
        if (new Date() > session.expiresAt) {
            throw new UnauthorizedException('Session has expired. Please log in again');
        }

        // If both token and session are valid, allow the request to proceed
        next();
    }
}
