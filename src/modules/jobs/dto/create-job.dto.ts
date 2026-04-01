import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateJobDto {
  @ApiProperty({ description: 'Título del trabajo' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Descripción del trabajo' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Dirección del trabajo' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Fecha del trabajo en formato ISO 8601' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Hora de inicio del trabajo en formato HH:mm' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: 'Duración estimada en horas' })
  @IsNumber()
  @Min(1)
  hours: number;

  @ApiProperty({ description: 'Precio ofrecido para el trabajo' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Estado del trabajo',
    default: 'open',
    enum: ['open', 'assigned', 'in_progress', 'done', 'cancelled'],
  })
  @IsEnum(['open', 'assigned', 'in_progress', 'done', 'cancelled'], {
    message: 'status must be a valid job status',
  })
  @IsOptional()
  status?: 'open' | 'assigned' | 'in_progress' | 'done' | 'cancelled';
}
