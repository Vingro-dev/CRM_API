import { Module, forwardRef } from '@nestjs/common';
import { ConversationGateway } from './websocket.gateway';
import { ConversationModule } from 'src/conversation/conversation.module';

@Module({
  imports: [forwardRef(() => ConversationModule)], // Use forwardRef here
  providers: [ConversationGateway],
  exports: [ConversationGateway],
})
export class WebSocketModule {}
