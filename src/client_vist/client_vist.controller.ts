import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClientVistService } from './client_vist.service';
import { CreateClientVistDto } from './dto/create-client_vist.dto';
import { UpdateClientVistDto } from './dto/update-client_vist.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('client-vist')
@Controller('client-vist')
//@UseGuards(JwtAuthGuard)
export class ClientVistController {

  constructor(private readonly clientVistService: ClientVistService) { }

  @Post('newenquiry')
  newEnquiry(@Body() data: any) {

    return this.clientVistService.newEnquiry(data);
  }

  @Get('FollowpGetOne/:id')
  getOneFollowup(@Param('id') id: number) {
    return this.clientVistService.FollowUpOneGet(id);
  }


  @Post('FollowUpSave')
  SaveFollowup(@Body() data: { FollowupData: any; ClientData: any; user_id: number }) {

    const { FollowupData, ClientData, user_id } = data;

    return this.clientVistService.FollowUPSave(FollowupData, ClientData, user_id);

  }

  @Get('newClientView/:id')
  getnewViewClient(@Param('id') id: number) {
    return this.clientVistService.newClinetView(id);
  }

}
