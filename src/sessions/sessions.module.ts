import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSession } from './session.entity';
import { SessionsService } from './sessions.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserSession])],
    providers: [SessionsService],
    exports: [SessionsService, TypeOrmModule], 
})
export class SessionsModule { }
