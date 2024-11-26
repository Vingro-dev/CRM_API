import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClientService {

  constructor(
    @InjectRepository(Client)
    private readonly ClientRepository: Repository<Client>
  ) { }
  create(createClientDto: CreateClientDto) {

    const newClient = this.ClientRepository.create(createClientDto)
    return this.ClientRepository.save(newClient)
  }

  findAll() {
    return this.ClientRepository.find({});
  }

  findOne(client_id: number) {
    return this.ClientRepository.findOne({ where: { client_id } });
  }

  async update(client_id: number, updateClientDto: UpdateClientDto) {
    const clientUpdate = await this.ClientRepository.findOne({ where: { client_id } });
    if (clientUpdate) throw new NotFoundException(`Client ${client_id} id is Not Found `)
    Object.assign(clientUpdate, updateClientDto)
    return await this.ClientRepository.save(clientUpdate);
  }

  async remove(client_id: number) {
    const clientDelete = await this.ClientRepository.findOne({ where: { client_id } });
    if (clientDelete) throw new NotFoundException(`Client ${client_id} id is Not Found `)
    return await this.ClientRepository.remove(clientDelete)

  }

  
}
