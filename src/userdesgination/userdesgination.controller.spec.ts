import { Test, TestingModule } from '@nestjs/testing';
import { UserdesginationController } from './userdesgination.controller';
import { UserdesginationService } from './userdesgination.service';

describe('UserdesginationController', () => {
  let controller: UserdesginationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserdesginationController],
      providers: [UserdesginationService],
    }).compile();

    controller = module.get<UserdesginationController>(UserdesginationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
