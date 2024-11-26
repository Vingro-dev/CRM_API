import { ApiProperty } from "@nestjs/swagger";

export class CreateServicesOfferDto {


    @ApiProperty()
    servicename: string

    @ApiProperty()
    createdBy: number

    @ApiProperty()
    createdAt: Date

}
