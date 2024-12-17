import { Module } from '@nestjs/common';
import { UserdesginationService } from './userdesgination.service';
import { UserdesginationController } from './userdesgination.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Userdesgination } from './entities/userdesgination.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Userdesgination, User])],
  controllers: [UserdesginationController],
  providers: [UserdesginationService],
})
export class UserdesginationModule { }
