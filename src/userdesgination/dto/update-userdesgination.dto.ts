import { PartialType } from '@nestjs/swagger';
import { CreateUserdesginationDto } from './create-userdesgination.dto';

export class UpdateUserdesginationDto extends PartialType(CreateUserdesginationDto) {}
