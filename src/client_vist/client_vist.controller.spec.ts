import { Test, TestingModule } from '@nestjs/testing';
import { ClientVistController } from './client_vist.controller';
import { ClientVistService } from './client_vist.service';

describe('ClientVistController', () => {
  let controller: ClientVistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientVistController],
      providers: [ClientVistService],
    }).compile();

    controller = module.get<ClientVistController>(ClientVistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
