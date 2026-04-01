import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';

interface AuthenticatedUser {
  id: string;
  firebase_uid: string;
}

@ApiTags('chat')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('firebase-token')
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('jobs/:id/messages')
  @ApiOkResponse({ type: [MessageResponseDto] })
  findMessages(
    @Param('id') jobId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MessageResponseDto[]> {
    return this.chatService.findMessages(jobId, user.id);
  }

  @Post('jobs/:id/messages')
  @ApiCreatedResponse({ type: MessageResponseDto })
  sendMessage(
    @Param('id') jobId: string,
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MessageResponseDto> {
    return this.chatService.sendMessage(
      jobId,
      user.id,
      createMessageDto.message,
    );
  }
}
