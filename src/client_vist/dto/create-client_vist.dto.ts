import { ApiProperty } from "@nestjs/swagger";
import { CreateClientDto } from "src/client/dto/create-client.dto";
import { ServicesOffer } from "src/services_offer/entities/services_offer.entity";


export class CreateClientVistDto extends CreateClientDto {

    @ApiProperty()
    user_id: number;

    @ApiProperty()
    client_id: number;

    @ApiProperty()
    conversation_sttime: number;

    @ApiProperty()
    conversation_endtime: number;

    @ApiProperty({ type: () => ServicesOffer })
    services: ServicesOffer;  // Reference to the entire ServicesOffer entity

    @ApiProperty()
    images: string;

    @ApiProperty()
    visit_type: string;

    @ApiProperty()
    Followup_type: string;

    @ApiProperty()
    latitude: number;

    @ApiProperty()
    longitude: number;

    @ApiProperty()
    Status: string;

    @ApiProperty()
    followup_Date: Date;
}
