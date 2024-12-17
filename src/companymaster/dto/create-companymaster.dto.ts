import { ApiProperty } from "@nestjs/swagger"

export class CreateCompanymasterDto {

    @ApiProperty()
    CompanyName: string

    @ApiProperty()
    created_at: Date

    @ApiProperty()
    createdby: number
}
