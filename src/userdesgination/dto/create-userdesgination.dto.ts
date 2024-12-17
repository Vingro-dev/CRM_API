import { ApiProperty } from "@nestjs/swagger";

export class CreateUserdesginationDto {

    @ApiProperty()
    DesginationName: string

    @ApiProperty()
    created_at: Date

    @ApiProperty()
    createdby: number

}
