import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsDate, IsMobilePhone, IsOptional } from "class-validator";
import { Gender } from "../entities/user.entity";


export class CreateUserDto {

    @ApiProperty({ description: "Full name of the user" })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: "Unique email address of the user" })
    @IsEmail()
    email: string;

    // @ApiProperty({ description: "Password for the user account" })
    // @IsNotEmpty()
    // password: string;

    // @ApiProperty({ description: "Role of the user, e.g., admin or user" })
    // @IsNotEmpty()
    // @IsString()
    // role: string;

    // @ApiProperty({ description: "Date of birth of the user" })
    // @IsDate()
    // DOB: Date;

    @ApiProperty({ description: "Mobile phone number of the user" })
    @IsMobilePhone()
    mobile: string;

    @ApiProperty({ description: "Address of the user", required: false })
    @IsOptional()
    @IsString()
    address: string;

    @ApiProperty({ description: "Gender of the user", enum: Gender })
    @IsEnum(Gender, { message: "Gender must be either 'male' or 'female'" })
    gender: Gender;


    @ApiProperty({ description: "Profile Is need" })
    @IsString()
    profile: Gender;

    @ApiProperty({ description: "Date when the user is created", required: false })
    @IsOptional()
    @IsDate()
    created_at: Date;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty({ description: "ID of the user Desgination Need" })
    @IsNotEmpty()
    des_id: number;

    @ApiProperty({ description: "ID of the user Company Need" })
    @IsNotEmpty()
    cm_id: number;

}
