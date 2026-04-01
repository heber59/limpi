import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  jobId: string;

  @ApiProperty()
  reviewerId: string;

  @ApiProperty()
  reviewedId: string;

  @ApiProperty()
  rating: number;

  @ApiProperty({ required: false, nullable: true })
  comment?: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;
}
