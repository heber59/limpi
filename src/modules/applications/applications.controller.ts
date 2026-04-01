import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationResponseDto } from './dto/application-response.dto';

interface AuthenticatedUser {
  id: string;
  firebase_uid: string;
}

@ApiTags('applications')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('firebase-token')
@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('jobs/:id/apply')
  @ApiCreatedResponse({ type: ApplicationResponseDto })
  apply(
    @Param('id') jobId: string,
    @Body() createApplicationDto: CreateApplicationDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApplicationResponseDto> {
    return this.applicationsService.apply(
      jobId,
      user.id,
      createApplicationDto.message,
    );
  }

  @Post('applications/:id/accept')
  @ApiOkResponse({ type: ApplicationResponseDto })
  accept(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApplicationResponseDto> {
    return this.applicationsService.accept(id, user.id);
  }

  @Post('applications/:id/reject')
  @ApiOkResponse({ type: ApplicationResponseDto })
  reject(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApplicationResponseDto> {
    return this.applicationsService.reject(id, user.id);
  }

  @Get('my-applications')
  @ApiOkResponse({ type: [ApplicationResponseDto] })
  findMine(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApplicationResponseDto[]> {
    return this.applicationsService.findMine(user.id);
  }
}
