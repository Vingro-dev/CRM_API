import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CompanymasterService } from './companymaster.service';
import { CreateCompanymasterDto } from './dto/create-companymaster.dto';


@Controller('companymaster')
export class CompanymasterController {
  constructor(private readonly companymasterService: CompanymasterService) { }

  @Post()
  create(@Body() createCompanymasterDto: CreateCompanymasterDto) {
    return this.companymasterService.create(createCompanymasterDto);
  }

  @Get()
  findAll() {
    return this.companymasterService.findAll();
  }

  @Patch()
  update(@Body() updateCompanymasterDto: any) {

    console.log(updateCompanymasterDto);

    return this.companymasterService.update(updateCompanymasterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companymasterService.remove(+id);
  }
}
