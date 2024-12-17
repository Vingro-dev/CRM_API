import { PartialType } from '@nestjs/swagger';
import { CreateCompanymasterDto } from './create-companymaster.dto';

export class UpdateCompanymasterDto extends PartialType(CreateCompanymasterDto) {}
