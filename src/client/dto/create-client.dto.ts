import { ApiProperty } from "@nestjs/swagger";

export class CreateClientDto {

    @ApiProperty()
    client_id: number;


    @ApiProperty()
    company_name: string;


    @ApiProperty()
    client_name: string;

    @ApiProperty()
    client_address: string;


    @ApiProperty()
    contact: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    created_by: number;

    @ApiProperty()
    created_at: Date;
}
