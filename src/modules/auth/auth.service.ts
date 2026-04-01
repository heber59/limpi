import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
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

type SupabaseSingleResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  getMe(user: SupabaseUserRow): UserResponseDto {
    return this.mapToResponse(user);
  }

  async register(
    registerDto: RegisterDto,
    firebaseUid: string,
  ): Promise<UserResponseDto> {
    const client = this.supabaseService.getClient();

    const { data: existingUser, error: selectError } =
      (await client
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single()) as SupabaseSingleResponse<SupabaseUserRow>;

    if (selectError && selectError.code !== 'PGRST116') {
      throw new InternalServerErrorException('Unable to query existing user');
    }

    if (existingUser) {
      return this.mapToResponse(existingUser);
    }

    const { data: createdUser, error: insertError } =
      (await client
        .from('users')
        .insert({
          firebase_uid: firebaseUid,
          name: registerDto.name,
          phone: registerDto.phone,
          role: registerDto.role,
        })
        .select()
        .single()) as SupabaseSingleResponse<SupabaseUserRow>;

    if (insertError || !createdUser) {
      throw new InternalServerErrorException('Unable to create user');
    }

    return this.mapToResponse(createdUser);
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
