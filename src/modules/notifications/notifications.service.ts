import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../../supabase/supabase.service';
import { NotificationTokenResponseDto } from './dto/notification-token-response.dto';

interface SupabaseNotificationRow {
  id: string;
  user_id: string;
  token: string;
  created_at: string;
  updated_at: string;
}

type SupabaseSingleResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async registerToken(
    userId: string,
    token: string,
  ): Promise<NotificationTokenResponseDto> {
    const { data: existingRecord, error: selectError } =
      (await this.supabaseService
        .getClient()
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .single()) as SupabaseSingleResponse<SupabaseNotificationRow>;

    if (selectError && selectError.code !== 'PGRST116') {
      throw new InternalServerErrorException(
        'Unable to verify notification token',
      );
    }

    if (existingRecord) {
      const { data: updatedRecord, error: updateError } =
        (await this.supabaseService
          .getClient()
          .from('notifications')
          .update({ token })
          .eq('id', existingRecord.id)
          .select()
          .single()) as SupabaseSingleResponse<SupabaseNotificationRow>;

      if (updateError || !updatedRecord) {
        throw new InternalServerErrorException(
          'Unable to update notification token',
        );
      }

      return this.mapToResponse(updatedRecord);
    }

    const { data: createdRecord, error: insertError } =
      (await this.supabaseService
        .getClient()
        .from('notifications')
        .insert({
          user_id: userId,
          token,
        })
        .select()
        .single()) as SupabaseSingleResponse<SupabaseNotificationRow>;

    if (insertError || !createdRecord) {
      throw new InternalServerErrorException(
        'Unable to register notification token',
      );
    }

    return this.mapToResponse(createdRecord);
  }

  private mapToResponse(
    record: SupabaseNotificationRow,
  ): NotificationTokenResponseDto {
    return {
      id: record.id,
      userId: record.user_id,
      token: record.token,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}
