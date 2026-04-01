import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateJobDto {
  @ApiPropertyOptional({ description: 'Título del trabajo' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Descripción del trabajo' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Dirección del trabajo' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Fecha del trabajo en formato ISO 8601' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Hora de inicio del trabajo en formato HH:mm',
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Duración estimada en horas' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  hours?: number;

  @ApiPropertyOptional({ description: 'Precio ofrecido para el trabajo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Estado del trabajo',
    enum: ['open', 'assigned', 'in_progress', 'done', 'cancelled'],
  })
  @IsOptional()
  @IsEnum(['open', 'assigned', 'in_progress', 'done', 'cancelled'], {
    message: 'status must be a valid job status',
  })
  status?: 'open' | 'assigned' | 'in_progress' | 'done' | 'cancelled';
}
