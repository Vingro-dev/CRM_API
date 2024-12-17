import { ApiProperty } from "@nestjs/swagger";

export class CreateUserTaskDto {

    @ApiProperty()
    Taskname: string;

    @ApiProperty()
    TaskStatus: string;

    @ApiProperty()
    Description: string;

    @ApiProperty()
    user_id: number;

    @ApiProperty()
    taskprofile: string;

    @ApiProperty()
    createdAt: Date;

}
