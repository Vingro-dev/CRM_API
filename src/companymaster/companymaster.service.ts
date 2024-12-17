import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanymasterDto } from './dto/create-companymaster.dto';
import { UpdateCompanymasterDto } from './dto/update-companymaster.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Companymaster } from './entities/companymaster.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CompanymasterService {

  constructor(@InjectRepository(Companymaster) private readonly CompanyRepository: Repository<Companymaster>) { }

  async create(props: any) {

    const exitsComapny = await this.CompanyRepository.findOne({ where: { CompanyName: props.CompanyName } })

    if (exitsComapny) throw new ConflictException('This Company Name already exists');

    const newComapny = this.CompanyRepository.create({
      CompanyName: props.CompanyName,
      createdby: props.user_id
    })

    return this.CompanyRepository.save(newComapny)
  }

  findAll() {
    return this.CompanyRepository.find({})
  }


  async update(data: any) {

    const existingData = await this.CompanyRepository.findOne({ where: { cm_id: data.cm_id } });

    if (!existingData) throw new NotFoundException(`Desgination with ID ${data.cm_id} not found`);

    await this.CompanyRepository.update({ cm_id: data.cm_id }, { CompanyName: data.CompanyName });

    return `User with ID ${data.Des_id} has been updated successfully`;

  }

  async remove(id: number) {

    const existingData = await this.CompanyRepository.findOne({ where: { cm_id: id } });

    if (!existingData) throw new NotFoundException(`Desgination with ID ${id} not found`);

    return await this.CompanyRepository.delete({ cm_id: id });
  }
}
