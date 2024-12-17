import { Module } from '@nestjs/common';
import { UserTaskService } from './user-task.service';
import { UserTaskController } from './user-task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTask } from './entities/user-task.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserTask, User])],
  controllers: [UserTaskController],
  providers: [UserTaskService],
})
export class UserTaskModule { }
