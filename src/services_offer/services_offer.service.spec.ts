import { Test, TestingModule } from '@nestjs/testing';
import { ServicesOfferService } from './services_offer.service';

describe('ServicesOfferService', () => {
  let service: ServicesOfferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicesOfferService],
    }).compile();

    service = module.get<ServicesOfferService>(ServicesOfferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
