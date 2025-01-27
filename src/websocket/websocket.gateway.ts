import {
    WebSocketGateway,
    SubscribeMessage,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationService } from 'src/conversation/conversation.service';

@WebSocketGateway({
    cors: {
        origin: '*', 
    },
})
export class ConversationGateway implements OnGatewayConnection, OnGatewayDisconnect {


    @WebSocketServer() server: Server;

    constructor(private readonly conversationService: ConversationService) { }

    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);

        const { userid } = client.handshake.query;


        console.log(userid, 'userid');


        if (!userid) {
            console.error('Missing userid in handshake query');
            client.disconnect();
            return;
        }

        // Update user status to online
        await this.conversationService.updateUserStatus(Number(userid), true, new Date());

        // Notify others about the online status
        this.server.emit('userStatusChange', { userid, status: 'online' });
    }


    async handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        const { userid } = client.handshake.query;
        if (!userid) return;
        await this.conversationService.updateUserStatus(Number(userid), false, new Date());
        // Notify others about the offline status
        this.server.emit('userStatusChange', { userid, status: 'offline', lastSeen: new Date() });
    }


    @SubscribeMessage('reconnect')
    async handleReconnect(client: Socket) {
        console.log(`Client reconnected: ${client.id}`);
        const userid = client.data.userid;
        const createdby = client.data.createdby;
        if (userid && createdby) {
            client.join(String(userid));
            await this.conversationService.updateUserStatus(userid, true, new Date());
            const messages = await this.conversationService.fetchMessages(userid, createdby);
            client.emit('chatHistory', messages);
            console.log(`Client ${client.id} rejoined room for user ${userid} and sender ${createdby}`);
        }
    }


    @SubscribeMessage('sendMessage')
    async handleMessage(client: Socket, payload: any) {
        console.log('Received message:', payload);
        const newMessage = await this.conversationService.createMessage({
            message: payload.message,
            userid: payload.userid,
            createdby: payload.createdby,
            isRead: false,
            createdAt: new Date(),
            sender_type: '',
            isUser: payload.isUser,
            user_id: payload.createdby,
        });
        this.server.to(String(payload.userid)).emit('receiveMessage', newMessage);
        this.server.to(String(payload.createdby)).emit('receiveMessage', newMessage);

        console.log(`Message sent to user ${payload.userid} and recipient ${payload.createdby}`);
    }

    
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(client: Socket, payload: { userid: number; createdby: number }) {
        console.log(payload, 'joinRoom');
        if (!payload.userid || !payload.createdby) {
            console.error('Invalid payload: Missing userid or createdby');
            client.disconnect();
            return;
        }
        client.join(String(payload.userid));
        const messages = await this.conversationService.fetchMessages(payload.userid, payload.createdby);
        client.emit('chatHistory', messages);

        console.log(`Client ${client.id} joined room for user ${payload.userid} and sender ${payload.createdby}`);
    }
}
