import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../../supabase/supabase.service';
import { MessageResponseDto } from './dto/message-response.dto';

type JobStatus = 'open' | 'assigned' | 'in_progress' | 'done' | 'cancelled';

interface SupabaseMessageRow {
  id: string;
  job_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface SupabaseJobRow {
  id: string;
  client_id: string;
  assigned_worker_id: string | null;
  status: JobStatus;
}

type SupabaseSingleResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};

type SupabaseListResponse<T> = {
  data: T[] | null;
  error: PostgrestError | null;
};

@Injectable()
export class ChatService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findMessages(
    jobId: string,
    userId: string,
  ): Promise<MessageResponseDto[]> {
    const job = await this.getJob(jobId);
    this.ensureJobParticipant(job, userId);

    const messagesResult = (await this.supabaseService
      .getClient()
      .from('messages')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', {
        ascending: true,
      })) as SupabaseListResponse<SupabaseMessageRow>;

    const { data: messages, error } = messagesResult;

    if (error) {
      throw new InternalServerErrorException('Unable to fetch messages');
    }

    return (messages ?? []).map((message) => this.mapToResponse(message));
  }

  async sendMessage(
    jobId: string,
    senderId: string,
    messageText: string,
  ): Promise<MessageResponseDto> {
    const job = await this.getJob(jobId);
    this.ensureJobParticipant(job, senderId);

    const messageResult = (await this.supabaseService
      .getClient()
      .from('messages')
      .insert({
        job_id: jobId,
        sender_id: senderId,
        message: messageText,
      })
      .select()
      .single()) as SupabaseSingleResponse<SupabaseMessageRow>;

    const { data: message, error } = messageResult;

    if (error || !message) {
      throw new InternalServerErrorException('Unable to send message');
    }

    return this.mapToResponse(message);
  }

  private async getJob(jobId: string): Promise<SupabaseJobRow> {
    const jobResult = (await this.supabaseService
      .getClient()
      .from('jobs')
      .select('id, client_id, assigned_worker_id, status')
      .eq('id', jobId)
      .single()) as SupabaseSingleResponse<SupabaseJobRow>;

    const { data: job, error } = jobResult;

    if (error || !job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  private ensureJobParticipant(job: SupabaseJobRow, userId: string): void {
    if (job.client_id !== userId && job.assigned_worker_id !== userId) {
      throw new ForbiddenException(
        'User is not authorized to access this job chat',
      );
    }
  }

  private mapToResponse(message: SupabaseMessageRow): MessageResponseDto {
    return {
      id: message.id,
      jobId: message.job_id,
      senderId: message.sender_id,
      message: message.message,
      createdAt: message.created_at,
    };
  }
}
