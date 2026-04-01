import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterNotificationTokenDto {
  @ApiProperty({ description: 'Token de notificación del dispositivo' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
