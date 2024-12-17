import { Test, TestingModule } from '@nestjs/testing';
import { CompanymasterService } from './companymaster.service';

describe('CompanymasterService', () => {
  let service: CompanymasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanymasterService],
    }).compile();

    service = module.get<CompanymasterService>(CompanymasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
