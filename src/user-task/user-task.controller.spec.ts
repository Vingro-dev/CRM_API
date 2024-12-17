import { Test, TestingModule } from '@nestjs/testing';
import { UserTaskController } from './user-task.controller';
import { UserTaskService } from './user-task.service';

describe('UserTaskController', () => {
  let controller: UserTaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserTaskController],
      providers: [UserTaskService],
    }).compile();

    controller = module.get<UserTaskController>(UserTaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
