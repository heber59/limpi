import { ApiProperty } from '@nestjs/swagger';

export class JobResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ type: String, format: 'date-time' })
  date: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  hours: number;

  @ApiProperty()
  price: number;

  @ApiProperty({
    enum: ['open', 'assigned', 'in_progress', 'done', 'cancelled'],
  })
  status: 'open' | 'assigned' | 'in_progress' | 'done' | 'cancelled';

  @ApiProperty({ required: false, nullable: true })
  assignedWorkerId?: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;
}
