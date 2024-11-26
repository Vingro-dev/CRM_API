import { ApiProperty } from "@nestjs/swagger";

export class CreateAttendanceDto {


    @ApiProperty()
    user_id: number;

    @ApiProperty()
    intime: Date;

    @ApiProperty()
    outime: Date;

    @ApiProperty()
    latitude: number;

    @ApiProperty()
    longitude: number;

    @ApiProperty()
    DeviceID: number;

}
