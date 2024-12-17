import { Module } from '@nestjs/common';
import { CompanymasterService } from './companymaster.service';
import { CompanymasterController } from './companymaster.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Companymaster } from './entities/companymaster.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Companymaster, User])],
  controllers: [CompanymasterController],
  providers: [CompanymasterService],
})
export class CompanymasterModule { }
