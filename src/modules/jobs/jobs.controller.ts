import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobResponseDto } from './dto/job-response.dto';

interface AuthenticatedUser {
  id: string;
  firebase_uid: string;
}

@ApiTags('jobs')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('firebase-token')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiCreatedResponse({ type: JobResponseDto })
  create(
    @Body() createJobDto: CreateJobDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<JobResponseDto> {
    return this.jobsService.create(createJobDto, user.id);
  }

  @Get()
  @ApiOkResponse({ type: [JobResponseDto] })
  findAll(): Promise<JobResponseDto[]> {
    return this.jobsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: JobResponseDto })
  findOne(@Param('id') id: string): Promise<JobResponseDto> {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: JobResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<JobResponseDto> {
    return this.jobsService.update(id, updateJobDto, user.id);
  }

  @Post(':id/cancel')
  @ApiOkResponse({ type: JobResponseDto })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<JobResponseDto> {
    return this.jobsService.cancel(id, user.id);
  }
}
