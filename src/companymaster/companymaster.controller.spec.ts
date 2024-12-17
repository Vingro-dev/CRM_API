import { Test, TestingModule } from '@nestjs/testing';
import { CompanymasterController } from './companymaster.controller';
import { CompanymasterService } from './companymaster.service';

describe('CompanymasterController', () => {
  let controller: CompanymasterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanymasterController],
      providers: [CompanymasterService],
    }).compile();

    controller = module.get<CompanymasterController>(CompanymasterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
