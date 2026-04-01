import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Nombre completo del usuario' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Teléfono del usuario' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: "Rol del usuario ('client' o 'worker')",
    enum: ['client', 'worker'],
  })
  @IsString()
  @IsIn(['client', 'worker'])
  role: 'client' | 'worker';

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
