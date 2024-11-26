import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServicesOfferService } from './services_offer.service';
import { CreateServicesOfferDto } from './dto/create-services_offer.dto';
import { UpdateServicesOfferDto } from './dto/update-services_offer.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('services-offer')
@Controller('services-offer')
@UseGuards(JwtAuthGuard)
export class ServicesOfferController {

  constructor(private readonly servicesOfferService: ServicesOfferService) { }

  @Post()
  create(@Body() createServicesOfferDto: CreateServicesOfferDto) {
    return this.servicesOfferService.create(createServicesOfferDto);
  }

  @Get()
  findAll() {
    return this.servicesOfferService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesOfferService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServicesOfferDto: UpdateServicesOfferDto) {
    return this.servicesOfferService.update(+id, updateServicesOfferDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesOfferService.remove(+id);
  }
}
