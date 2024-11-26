import { Module } from '@nestjs/common';
import { ServicesOfferService } from './services_offer.service';
import { ServicesOfferController } from './services_offer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesOffer } from './entities/services_offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServicesOffer])],
  controllers: [ServicesOfferController],
  providers: [ServicesOfferService],
})
export class ServicesOfferModule { }
