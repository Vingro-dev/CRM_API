import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UserTaskService } from './user-task.service';
import { CreateUserTaskDto } from './dto/create-user-task.dto';
import { UpdateUserTaskDto } from './dto/update-user-task.dto';

@Controller('user-task')
export class UserTaskController {
  constructor(private readonly userTaskService: UserTaskService) { }

  @Post()
  create(@Body() createUserTaskDto: any) {

    console.log(createUserTaskDto.user_id, createUserTaskDto.tasks);

    return this.userTaskService.create(createUserTaskDto);
  }

  @Get()
  findAll() {
    return this.userTaskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userTaskService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserTaskDto: any) {
    return this.userTaskService.update(+id, updateUserTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userTaskService.remove(+id);
  }


  @Get('adminTaskView/:id')
  adminTaskView(@Param('id') id: string, @Query('mood') mood: string, @Query('fromdate') fromdate: string, @Query('todate') todate: string,) {
    return this.userTaskService.adminTaskView(+id, mood, fromdate, todate);
  }

}
