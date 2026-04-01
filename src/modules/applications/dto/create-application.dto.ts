import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @ApiPropertyOptional({ description: 'Mensaje de postulación' })
  @IsOptional()
  @IsString()
  message?: string;
}
