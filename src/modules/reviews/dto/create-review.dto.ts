import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID del trabajo relacionado' })
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @ApiProperty({ description: 'ID del usuario que recibe la calificación' })
  @IsString()
  @IsNotEmpty()
  reviewedId: string;

  @ApiProperty({ description: 'Calificación numérica entre 1 y 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Comentario opcional de la calificación',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
