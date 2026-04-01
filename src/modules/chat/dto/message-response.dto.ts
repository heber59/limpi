import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  jobId: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;
}
