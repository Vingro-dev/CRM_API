
import { ApiProperty } from "@nestjs/swagger";

export class CreateConversationDto {

    @ApiProperty()
    message: string;

    @ApiProperty({ default: false })
    isUser: boolean;

    @ApiProperty({ default: false })
    isRead: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    userid: number;

    @ApiProperty()
    user_id: number;

    @ApiProperty()
    sender_type: string;

    @ApiProperty()
    createdby: number
}




