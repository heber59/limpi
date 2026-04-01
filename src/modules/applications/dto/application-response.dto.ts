import { ApiProperty } from '@nestjs/swagger';

export class ApplicationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  jobId: string;

  @ApiProperty()
  workerId: string;

  @ApiProperty({ enum: ['pending', 'accepted', 'rejected'] })
  status: 'pending' | 'accepted' | 'rejected';

  @ApiProperty({ required: false, nullable: true })
  message?: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;
}
