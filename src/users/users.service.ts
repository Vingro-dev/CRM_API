import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private readonly UserRepository: Repository<User>) { }


  async findByEmail(email: string): Promise<User | undefined> {

    console.log("emaildata", await this.UserRepository.findOne({ where: { email } }));

    return await this.UserRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto) {

    const name = createUserDto.name

    const email = createUserDto.email

    const AlreadyExits = await this.UserRepository.findOne({ where: { name, email } })

    if (AlreadyExits) throw new ConflictException('This user already exists');

    const hashPassword = await bcrypt.hash(createUserDto.password, 10)

    const newUser = this.UserRepository.create({
      ...createUserDto,
      password: hashPassword
    })

    return this.UserRepository.save(newUser)
  }

  findAll() {
    return this.UserRepository.find({});
  }

  findOne(user_id: number) {
    return this.UserRepository.findOne({ where: { user_id } });
  }

  async update(user_id: number, updateUserDto: UpdateUserDto) {

    const existingUser = await this.UserRepository.findOne({ where: { user_id } });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    await this.UserRepository.update(user_id, updateUserDto);

    return `User with ID ${user_id} has been updated successfully`;
  }

  async remove(user_id: number) {

    return await this.UserRepository.delete({ user_id });
  }
}
