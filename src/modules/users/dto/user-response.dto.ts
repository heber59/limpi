import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ enum: ['client', 'worker'] })
  role: 'client' | 'worker';

  @ApiProperty({ required: false, nullable: true })
  profilePhotoUrl?: string | null;

  @ApiProperty({ required: false, nullable: true })
  documentPhotoUrl?: string | null;

  @ApiProperty({ required: false, nullable: true })
  rating?: number | null;

  @ApiProperty()
  ratingCount: number;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;
}
