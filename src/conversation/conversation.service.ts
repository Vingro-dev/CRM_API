import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Conversation } from './entities/conversation.entity';
import { format } from 'date-fns';

@Injectable()
export class ConversationService {

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }



  async createMessage(createConversationDto: CreateConversationDto) {
    const newConversation = this.conversationRepository.create({
      message: createConversationDto.message,
      isUser: createConversationDto.isUser,
      isRead: createConversationDto.isRead,
      createdAt: createConversationDto.createdAt,
      userid: createConversationDto.userid,
      createdby: createConversationDto.user_id
    });
    const savedConversation = await this.conversationRepository.save(newConversation);
    return savedConversation;
  }

  // Fetch old messages between two users (sender and recipient)
  async fetchMessages(userId: number, recipientId: number) {
    return this.conversationRepository.find({
      where: [
        { userid: userId, createdby: recipientId },
        { userid: recipientId, createdby: userId },
      ],
      order: { createdAt: 'DESC' },
    });
  }


  async updateUserStatus(userid: number, isOnline: boolean, lastSeen: any) {
    return this.userRepository.update({ user_id: userid }, { isOnline, lastOnline: lastSeen })
  }


  getMessages(userId: number, recipientId: number) {
    return this.conversationRepository.find({ where: { userid: userId, createdby: recipientId } })
  }


  async create(createConversationDto: CreateConversationDto) {

    const newConversation = this.conversationRepository.create(
      {
        message: createConversationDto.message,
        isUser: createConversationDto.isUser,
        isRead: createConversationDto.isRead,
        createdAt: createConversationDto.createdAt,
        userid: createConversationDto.userid,
        createdby: createConversationDto.user_id

      }
    )

    const savedConversation = await this.conversationRepository.save(newConversation);
    return savedConversation
  }


  findAll() {
    return `This action returns all conversation`;
  }


  async findOne(userid: number, page: number, limit: number, createdby: number) {

    console.log(userid, page, limit, createdby);

    const offset = (page - 1) * limit;

    // Fetch conversations where either the logged-in user or the chat partner is involved
    const conversations = await this.conversationRepository.find({
      where: [
        { userid: userid, createdby: createdby },  // Chat where logged-in user is the recipient and createdby is the sender
        { userid: createdby, createdby: userid },  // Chat where the logged-in user is the sender and createdby is the recipient
      ],
      order: { createdAt: 'DESC' },
      take: limit,   // Limit number of messages
      skip: offset,  // Apply pagination
    });

    // Return both the conversations
    return {
      conversations: conversations,
    };
  }




  async findAllUserListwithmsg(userid: number,page: number,limit: number,viewerType: "user" | "admin") {
    
    const offset = (page - 1) * limit;

    const userRole = viewerType === "admin" ? "user" : "admin";

    const users = await this.userRepository.find({
      take: limit,
      skip: offset,
      where: { role: userRole },
      select: [
        "user_id",
        "name",
        "profile",
        "isActive",
        "isOnline", // Add isOnline
        "lastOnline", // Add lastOnline
      ],
    });

    if (users.length === 0) {
      return [];
    }

  
    const userIds = users.map((user) => user.user_id);

    // Fetch the most recent conversation for all users in one query
    const conversations = await this.conversationRepository
      .createQueryBuilder("conversation")
      .select([
        "conversation.createdby AS createdby",
        "conversation.message AS message",
        "conversation.createdAt AS createdAt",
      ])
      .where("conversation.createdby IN (:...userIds)", { userIds })
      .orderBy("conversation.createdAt", "DESC")
      .getRawMany();

    // Fetch unread counts for all users in one query
    const unreadCounts = await this.conversationRepository
      .createQueryBuilder("conversation")
      .select([
        "conversation.createdby AS createdby",
        "COUNT(*) AS unreadCount",
      ])
      .where("conversation.userid = :userid", { userid })
      .andWhere("conversation.isRead = :isRead", { isRead: false }) // Check `isRead` condition
      .groupBy("conversation.createdby")
      .getRawMany();

    // Map data for faster lookup
    const conversationMap = conversations.reduce((map, convo) => {
      if (!map[convo.createdby]) {
        map[convo.createdby] = convo; // Keep only the most recent message
      }
      return map;
    }, {});

    const unreadCountMap = unreadCounts.reduce((map, unread) => {
      map[unread.createdby] = parseInt(unread.unreadCount, 10) || 0;
      return map;
    }, {});

    // Build the final response
    const result = users.map((user) => {
      const lastConversation = conversationMap[user.user_id] || {};
      const unreadCount = unreadCountMap[user.user_id] || 0;

      return {
        userId: user.user_id,
        username: user.name,
        profile: user.profile, // Include user's avatar
        isactive: user.isActive,
        isOnline: user.isOnline,
        lastOnline: user.isOnline ? "Online" : user.lastOnline,
        lastMessage: lastConversation.message || "No messages found",
        createdAt: lastConversation.createdAt || null,
        formattedCreatedAt: lastConversation.createdAt
          ? format(new Date(lastConversation.createdAt), "MMM dd yyyy hh:mm a")
          : null,
        unreadCount, // Include the unread message count
      };
    });

    // Sort the result: users with recent messages first, "No messages found" users at the bottom
    const sortedResult = result.sort((a, b) => {
      if (!a.createdAt && !b.createdAt) return 0; // Both have no messages
      if (!a.createdAt) return 1; // Move "No messages found" to the bottom
      if (!b.createdAt) return -1; // Keep users with messages at the top
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Sort by recent message
    });

    return sortedResult;
  }





  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }



  async getUnreadMessages(userId: number, viewerType: "user" | "admin") {

    if (viewerType === "user") {
      return this.getUnreadMessagesForUser(userId)
    } else {
      return this.getUnreadMessagesForAdmin(userId)
    }


  }

  async getUnreadMessagesForAdmin(adminId: number): Promise<{ unreadCount: number, conversations: any[] }> {
    // Count of unread messages that are not created by the admin
    const query = this.conversationRepository.createQueryBuilder("conversation")
      .select("COUNT(*)", "unreadCount") // Total count of unread messages
      .where("conversation.isRead = :isRead", { isRead: false }) // Only unread messages
      .andWhere("conversation.createdby != :adminId", { adminId }); // Messages not created by admin

    const result = await query.getRawOne();
    const unreadCount = parseInt(result?.unreadCount || "0", 10);


    const conversations = await this.conversationRepository.find({
      where: { createdby: Not(adminId), isRead: false, isUser: true },
      order: { createdAt: 'ASC' },
    });

    // Fetch usernames and format the conversation data
    const conversationsWithUsernames = await Promise.all(conversations.map(async (conversation) => {
      const createdByUser = await this.userRepository.findOne({ where: { user_id: conversation.createdby } });

      return {
        ...conversation,
        username: createdByUser ? createdByUser.name : 'Unknown', // Add the username or 'Unknown' if not found
        formattedCreatedAt: format(conversation.createdAt, 'MMM dd yyyy hh:mm a'), // Add formatted date
      };
    }));

    return { unreadCount, conversations: conversationsWithUsernames };
  }




  async getUnreadMessagesForUser(userId: number): Promise<{ unreadCount: number, conversations: any[] }> {

    const unreadCountQuery = this.conversationRepository.createQueryBuilder("conversation")
      .select("COUNT(*)", "unreadCount")
      .where("conversation.isRead = :isRead", { isRead: false })
      .andWhere("conversation.userid = :userId", { userId })
      .andWhere("conversation.createdby != :userId", { userId });

    const result = await unreadCountQuery.getRawOne();
    const unreadCount = parseInt(result?.unreadCount || "0", 10);



    const conversations = await this.conversationRepository.find({
      where: { userid: userId, isRead: false, isUser: false },
      order: { createdAt: 'ASC' },
    });


    const conversationsWithUsernames = await Promise.all(conversations.map(async (conversation) => {

      const createdByUser = await this.userRepository.findOne({ where: { user_id: conversation.createdby } });

      return {
        ...conversation,
        username: createdByUser ? createdByUser.name : 'Unknown', // Add the username or 'Unknown' if not found
        formattedCreatedAt: format(conversation.createdAt, 'MMM dd yyyy hh:mm a'), // Add formatted date
      };
    }));

    return { unreadCount, conversations: conversationsWithUsernames };
  }



  async getUnreadMessagesForUserData(userId: number) {

    const user = await this.userRepository.findOne({ where: { user_id: userId } })
    const conversations = await this.conversationRepository.find({
      where: { userid: userId, isRead: false, isUser: false },
      order: { createdAt: 'ASC' },

    });
    return conversations.map((conversation) => {
      return {
        ...conversation,
        username: user.name || 'Unknown', // Attach username (if available)
      };
    });
  }

  async markMessagesAsRead(
    userId: number,
    viewerType: "user" | "admin",
  ): Promise<void> {

    const query = this.conversationRepository.createQueryBuilder()
      .update("Conversation")
      .set({ isRead: true });

    if (viewerType === "user") {
      // Mark admin messages as read when viewed by user
      query.where("userid = :userId", { userId })
        .andWhere("createdby != :userId", { userId }); // Only admin-created messages
    } else {
      // Mark user messages as read when viewed by admin
      query.where("userid = :userId", { userId }) // Target user messages
        .andWhere("createdby = :userId", { userId }); // Only user-created messages
    }

    await query.execute();
  }



  async markMessagesAsReadByone(
    userId: number,
  ) {
    try {


      console.log(userId, 'mark as read');

      // Fetch all unread notifications for the user
      const notifications = await this.conversationRepository.find({
        where: { isRead: false, userid: userId },
      });

      notifications.forEach(notification => {
        notification.isRead = true; // Mark as read
      });

      await this.conversationRepository.save(notifications);

      return { success: true, message: 'Notifications marked as read' };
    } catch (error) {
      console.error(error);
      throw new Error('Error marking notifications as read');
    }
  }





}
