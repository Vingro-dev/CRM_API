import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserdesginationDto } from './dto/update-userdesgination.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Userdesgination } from './entities/userdesgination.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserdesginationService {

  constructor(
    @InjectRepository(Userdesgination) private readonly UserDesRepository: Repository<Userdesgination>
  ) { }

  async create(createUserdesginationDto: any) {

    const DesginationName = createUserdesginationDto.DesginationName

    const exitsDegination = await this.UserDesRepository.findOne({ where: { DesginationName } })

    if (exitsDegination) throw new ConflictException('This Desgination already exists');
    
    const newDegination = this.UserDesRepository.create({
      DesginationName: createUserdesginationDto.DesginationName,
      createdby: createUserdesginationDto.user_id
    })

    return this.UserDesRepository.save(newDegination)
  }

  findAll() {
    return this.UserDesRepository.find({});
  }


  async update(data: any) {

    const existingData = await this.UserDesRepository.findOne({ where: { Des_id: data.Des_id } });

    if (!existingData) {
      throw new NotFoundException(`Desgination with ID ${data.Des_id} not found`);
    }

    await this.UserDesRepository.update({ Des_id: data.Des_id }, { DesginationName: data.DesginationName });

    return `User with ID ${data.Des_id} has been updated successfully`;
  }

  async remove(id: number) {

    const existingData = await this.UserDesRepository.findOne({ where: { Des_id: id } });

    if (!existingData) {
      throw new NotFoundException(`Desgination with ID ${id} not found`);
    }

    console.log(id);


    return await this.UserDesRepository.delete({ Des_id: id });
  }
}
