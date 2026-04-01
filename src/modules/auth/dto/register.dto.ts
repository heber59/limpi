import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Phone number of the user' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: "User role ('client' or 'worker')",
    enum: ['client', 'worker'],
  })
  @IsString()
  @IsIn(['client', 'worker'])
  role: 'client' | 'worker';
}
