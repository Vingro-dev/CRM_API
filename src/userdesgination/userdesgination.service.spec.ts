import { Test, TestingModule } from '@nestjs/testing';
import { UserdesginationService } from './userdesgination.service';

describe('UserdesginationService', () => {
  let service: UserdesginationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserdesginationService],
    }).compile();

    service = module.get<UserdesginationService>(UserdesginationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
