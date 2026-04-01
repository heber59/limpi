import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

type UserRole = 'client' | 'worker';

interface SupabaseUserRow {
  id: string;
  firebase_uid: string;
  name: string;
  phone: string;
  role: UserRole;
  profile_photo_url: string | null;
  document_photo_url: string | null;
  rating: number | null;
  rating_count: number;
  is_verified: boolean;
  created_at: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(
    createUserDto: CreateUserDto,
    firebaseUid: string,
  ): Promise<UserResponseDto> {
    const client = this.supabaseService.getClient();

    const { data: existingUser, error: selectError } = await client
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw new InternalServerErrorException('Unable to verify existing user');
    }

    if (existingUser) {
      return this.mapToResponse(existingUser as SupabaseUserRow);
    }

    const { data: createdUser, error: insertError } = await client
      .from('users')
      .insert({
        firebase_uid: firebaseUid,
        name: createUserDto.name,
        phone: createUserDto.phone,
        role: createUserDto.role,
        profile_photo_url: createUserDto.profilePhotoUrl ?? null,
        document_photo_url: createUserDto.documentPhotoUrl ?? null,
      })
      .select()
      .single();

    if (insertError || !createdUser) {
      throw new InternalServerErrorException('Unable to create user');
    }

    return this.mapToResponse(createdUser as SupabaseUserRow);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const { data: user, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      throw new NotFoundException('User not found');
    }

    return this.mapToResponse(user as SupabaseUserRow);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requesterId: string,
  ): Promise<UserResponseDto> {
    if (id !== requesterId) {
      throw new ForbiddenException('Cannot update another user');
    }

    const updatePayload: Partial<SupabaseUserRow> = {
      name: updateUserDto.name,
      phone: updateUserDto.phone,
      role: updateUserDto.role,
      profile_photo_url: updateUserDto.profilePhotoUrl,
      document_photo_url: updateUserDto.documentPhotoUrl,
    };

    const { data: updatedUser, error } = await this.supabaseService
      .getClient()
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedUser) {
      throw new InternalServerErrorException('Unable to update user');
    }

    return this.mapToResponse(updatedUser as SupabaseUserRow);
  }

  private mapToResponse(user: SupabaseUserRow): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      profilePhotoUrl: user.profile_photo_url,
      documentPhotoUrl: user.document_photo_url,
      rating: user.rating != null ? Number(user.rating) : null,
      ratingCount: user.rating_count,
      isVerified: user.is_verified,
      createdAt: user.created_at,
    };
  }
}
