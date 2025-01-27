import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) { }

  @Post()
  create(@Body() createConversationDto: any) {
    console.log(createConversationDto);
    return this.conversationService.create(createConversationDto);
  }



  @Get()
  findAll(
    @Query('userid') userid: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('viewerType') viewerType: "user" | "admin"
  ) {
    return this.conversationService.findAllUserListwithmsg(+userid, +page, +limit, viewerType);
  }



  @Get(':userid')
  findOne(
    @Param('userid') userid: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('createdby') createdby: string,
  ) {
    // Convert query params to numbers
    return this.conversationService.findOne(+userid, +page, +limit, +createdby);
  }




  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConversationDto: UpdateConversationDto) {
    return this.conversationService.update(+id, updateConversationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversationService.remove(+id);
  }


  // Fetch unread messages (count + data)
  @Get('unread-messages/:userId/:viewerType')
  async getUnreadMessages(
    @Param('userId') userId: number,
    @Param('viewerType') viewerType: "user" | "admin",
  ) {
    const result = await this.conversationService.getUnreadMessages(userId, viewerType);
    return result;
  }

  // Mark messages as read
  @Post('mark-as-read/:userId/:viewerType')
  async markMessagesAsRead(
    @Param('userId') userId: number,
    @Param('viewerType') viewerType: "user" | "admin",
  ) {
    await this.conversationService.markMessagesAsRead(userId, viewerType);
    return { success: true };
  }



  @Get('unread-messages-users/:userId')
  async getUnreadMessagesdata(
    @Param('userId') userId: number,
  ) {
   const result = await this.conversationService.getUnreadMessagesForUserData(userId);
    return result;
  }


  @Post('mark-as-read-One/:userId')
  async markMessagesAsReadByone(
    @Param('userId') userId: number,
  ) {
    await this.conversationService.markMessagesAsReadByone(userId);
    return { success: true };
  }




  // @Post('update-online-status')
  // async updateOnlineStatus(@Body() body: { userId: number, isOnline: boolean }) {
  //   await this.conversationService.updateOnlineStatus(body.userId, body.isOnline);
  //   return { success: true };
  // }


}
