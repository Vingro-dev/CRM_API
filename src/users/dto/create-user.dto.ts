import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class CreateUserDto {


    @ApiProperty()
    name: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    role: "Admin" | "Employee";

    @ApiProperty()
    created_at: Date;

    @ApiProperty()
    Createdby: number

}
