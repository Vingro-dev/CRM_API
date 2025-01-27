import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from './session.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SessionsService {
    constructor(
        @InjectRepository(UserSession)
        private sessionsRepository: Repository<UserSession>,
    ) { }

    async createSession(sessionData: Partial<UserSession>): Promise<UserSession> {
        const session = this.sessionsRepository.create(sessionData);
        return await this.sessionsRepository.save(session);
    }

    async getSessionsByUser(userId: string): Promise<UserSession[]> {
        return await this.sessionsRepository.find({ where: { id: userId } });
    }

    async deleteSessionByDeviceId(userId: string, deviceId: string): Promise<void> {
        await this.sessionsRepository.delete({ id: userId, deviceId: deviceId })
    }

    async findSessionByTokenAndDevice(token: string, deviceId: string): Promise<UserSession> {
        return await this.sessionsRepository.findOne({ where: { token, deviceId } });
    }
}
