import { Test, TestingModule } from '@nestjs/testing';
import { ClientVistService } from './client_vist.service';

describe('ClientVistService', () => {
  let service: ClientVistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientVistService],
    }).compile();

    service = module.get<ClientVistService>(ClientVistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
