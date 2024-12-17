import { Injectable } from '@nestjs/common';
import { CreateUserTaskDto } from './dto/create-user-task.dto';
import { UpdateUserTaskDto } from './dto/update-user-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserTask } from './entities/user-task.entity';
import { Between, Repository } from 'typeorm';
import { endOfDay, startOfDay, subDays } from 'date-fns';

@Injectable()
export class UserTaskService {

  constructor(@InjectRepository(UserTask) private UserTaskRepository: Repository<UserTask>) { }

  create(createUserTaskDto: any) {

    const { user_id, tasks } = createUserTaskDto;

    if (!tasks || tasks.length === 0) {
      throw new Error("No tasks provided.");
    }

    const newTasks = tasks.map((task: any) => {
      return this.UserTaskRepository.create({
        Taskname: task.Taskname,
        TaskStatus: task.TaskStatus,
        Description: task.Description,
        user_id: user_id,
        taskprofile: task.taskprofile
      });
    });

    return this.UserTaskRepository.save(newTasks);
  }


  findAll() {
    return `This action returns all userTask`;
  }

  async findOne(user_id: number) {

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const response = await this.UserTaskRepository.find({ where: { user_id, createdAt: Between(todayStart, todayEnd) } })
    return response;
  }

  update(id: number, updateUserTaskDto: UpdateUserTaskDto) {
    return `This action updates a #${id} userTask`;
  }

  async remove(taskid: number) {
    return await this.UserTaskRepository.delete({ taskid });
  }

  async adminTaskView(user_id: number, mood: string, fromdate: string, todate: string) {

    console.log(user_id, mood, fromdate, todate);



    if (mood === 'today') {

      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      const response = await this.UserTaskRepository.find({ where: { user_id, createdAt: Between(todayStart, todayEnd) } })
      return response;

    }

    if (mood === 'yesterday') {
      const yesterdayStart = startOfDay(subDays(new Date(), 1));
      const yesterdayEnd = endOfDay(subDays(new Date(), 1));


      const response = await this.UserTaskRepository.find({
        where: {
          user_id,
          createdAt: Between(yesterdayStart, yesterdayEnd)
        },
      });
      return response;
    }

    if (mood === 'custom') {

      const todayStart = startOfDay(new Date(fromdate));
      const todayEnd = endOfDay(new Date(todate));
      const response = await this.UserTaskRepository.find({ where: { user_id, createdAt: Between(todayStart, todayEnd) }, order: { createdAt: 'desc' } })
      return response;

    }



  }



}
