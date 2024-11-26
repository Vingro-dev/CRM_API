import { Module } from '@nestjs/common';
import { ClientVistService } from './client_vist.service';
import { ClientVistController } from './client_vist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientVist } from './entities/client_vist.entity';
import { ClientModule } from 'src/client/client.module';
import { Client } from 'src/client/entities/client.entity';
import { ServicesOffer } from 'src/services_offer/entities/services_offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientVist, Client, ServicesOffer]), ClientModule],
  controllers: [ClientVistController],
  providers: [ClientVistService],
})
export class ClientVistModule { }
