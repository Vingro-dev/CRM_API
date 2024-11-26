import { PartialType } from '@nestjs/swagger';
import { CreateClientVistDto } from './create-client_vist.dto';

export class UpdateClientVistDto extends PartialType(CreateClientVistDto) {}
