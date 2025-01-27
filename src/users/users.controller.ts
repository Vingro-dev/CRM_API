import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {

    console.log(createUserDto);

    return this.usersService.create(createUserDto);
  }

  //@UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }


  // @UseGuards(JwtAuthGuard)

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  //@UseGuards(JwtAuthGuard)

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  // @UseGuards(JwtAuthGuard)

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('activeUser/:id')
  async isActiveuser(@Param('id') id: string, @Query('mood') mood: string) {

    console.log(id);

    return await this.usersService.isActiveuser(Number(id), mood);
  }



  @Post('UpdateUserprofile/:id')
  async updateUserProfile_Useronly(@Param('id') id: string, @Query('mood') mood: string, @Body() updateUserDto: any) {


    return await this.usersService.updateUserProfile_Useronly(+id, mood, updateUserDto)
  }




  @Post('update-online-status')
  async updateOnlineStatus(@Body() body: { userId: number, isOnline: boolean }) {
    await this.usersService.updateOnlineStatus(body.userId, body.isOnline);
    return { success: true };
  }

}
