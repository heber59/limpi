import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/user-response.dto';

interface AuthenticatedUser {
  id: string;
  firebase_uid: string;
  name: string;
  phone: string;
  role: 'client' | 'worker';
  profile_photo_url: string | null;
  document_photo_url: string | null;
  rating: number | null;
  rating_count: number;
  is_verified: boolean;
  created_at: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-token')
  @ApiOkResponse({ type: UserResponseDto })
  getMe(@CurrentUser() user: AuthenticatedUser): UserResponseDto {
    return this.authService.getMe(user);
  }

  @Post('register')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-token')
  @ApiCreatedResponse({ type: UserResponseDto })
  register(
    @Body() registerDto: RegisterDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.authService.register(registerDto, user.firebase_uid);
  }
}
