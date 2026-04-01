import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RegisterNotificationTokenDto } from './dto/register-notification-token.dto';
import { NotificationTokenResponseDto } from './dto/notification-token-response.dto';

interface AuthenticatedUser {
  id: string;
  firebase_uid: string;
}

@ApiTags('notifications')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('firebase-token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('token')
  @ApiCreatedResponse({ type: NotificationTokenResponseDto })
  registerToken(
    @Body() registerNotificationTokenDto: RegisterNotificationTokenDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationTokenResponseDto> {
    return this.notificationsService.registerToken(
      user.id,
      registerNotificationTokenDto.token,
    );
  }
}
