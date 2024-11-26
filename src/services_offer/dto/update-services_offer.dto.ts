import { PartialType } from '@nestjs/swagger';
import { CreateServicesOfferDto } from './create-services_offer.dto';

export class UpdateServicesOfferDto extends PartialType(CreateServicesOfferDto) {}
