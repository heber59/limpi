import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Nombre completo del usuario' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Teléfono del usuario' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: "Rol del usuario ('client' o 'worker')",
    enum: ['client', 'worker'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['client', 'worker'])
  role?: 'client' | 'worker';

  @ApiPropertyOptional({ description: 'URL de foto de perfil' })
  @IsOptional()
  @IsString()
  @IsUrl()
  profilePhotoUrl?: string;

  @ApiPropertyOptional({ description: 'URL de foto de documento' })
  @IsOptional()
  @IsString()
  @IsUrl()
  documentPhotoUrl?: string;
}
