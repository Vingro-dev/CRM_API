import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserdesginationService } from './userdesgination.service';
import { CreateUserdesginationDto } from './dto/create-userdesgination.dto';
import { UpdateUserdesginationDto } from './dto/update-userdesgination.dto';

@Controller('userdesgination')
export class UserdesginationController {
  constructor(private readonly userdesginationService: UserdesginationService) { }

  @Post()
  create(@Body() createUserdesginationDto: any) {

    console.log(createUserdesginationDto, 'desgination');

    return this.userdesginationService.create(createUserdesginationDto);
  }

  @Get()
  findAll() {
    return this.userdesginationService.findAll();
  }


  @Patch()
  update(@Body() updateUserdesginationDto: any) {
    console.log(updateUserdesginationDto);
    return this.userdesginationService.update(updateUserdesginationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {

    console.log(id, 'id');

    return this.userdesginationService.remove(+id);
  }
}
