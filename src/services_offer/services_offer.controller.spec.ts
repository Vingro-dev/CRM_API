import { Test, TestingModule } from '@nestjs/testing';
import { ServicesOfferController } from './services_offer.controller';
import { ServicesOfferService } from './services_offer.service';

describe('ServicesOfferController', () => {
  let controller: ServicesOfferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesOfferController],
      providers: [ServicesOfferService],
    }).compile();

    controller = module.get<ServicesOfferController>(ServicesOfferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
