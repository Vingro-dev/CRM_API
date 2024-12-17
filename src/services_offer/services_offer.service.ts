import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateServicesOfferDto } from './dto/create-services_offer.dto';
import { UpdateServicesOfferDto } from './dto/update-services_offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ServicesOffer } from './entities/services_offer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ServicesOfferService {

  constructor(@InjectRepository(ServicesOffer)
  private readonly ServiceRepository: Repository<ServicesOffer>) { }

  async create(createServicesOfferDto: any) {

    const servicename = createServicesOfferDto.servicename
    const AlreadyExits = await this.ServiceRepository.findOne({ where: { servicename } })
    if (AlreadyExits) throw new ConflictException('This Services already exists');

    const newService = this.ServiceRepository.create({
      servicename: createServicesOfferDto.servicename,
      createdBy: createServicesOfferDto.user_id,
    })

    return this.ServiceRepository.save(newService)
  }

  findAll() {
    return this.ServiceRepository.find({});
  }


  async update(s_id: number, data: any) {

    console.log(s_id, data);


    const existingUser = await this.ServiceRepository.findOne({ where: { s_id } });

    if (!existingUser) {
      throw new NotFoundException(`Service with ID ${s_id} not found`);
    }

    await this.ServiceRepository.update({ s_id }, { servicename: data.servicename });

    return `User with ID ${s_id} has been updated successfully`;

  }

  async remove(s_id: number) {

    const existingUser = await this.ServiceRepository.findOne({ where: { s_id } });

    if (!existingUser) {
      throw new NotFoundException(`Service with ID ${s_id} not found`);
    }

    return this.ServiceRepository.delete({ s_id });
  }
}
