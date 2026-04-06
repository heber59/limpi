import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../../supabase/supabase.service';
import { ApplicationResponseDto } from './dto/application-response.dto';

type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

interface SupabaseApplicationRow {
  id: string;
  job_id: string;
  worker_id: string;
  status: ApplicationStatus;
  message: string | null;
  created_at: string;
}

interface SupabaseJobRow {
  id: string;
  client_id: string;
  status: string;
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
export class ApplicationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async apply(
    jobId: string,
    workerId: string,
    message?: string,
  ): Promise<ApplicationResponseDto> {
    const client = this.supabaseService.getClient();

    const { data: existingApplication, error: selectError } = (await client
      .from('applications')
      .select('*')
      .eq('job_id', jobId)
      .eq('worker_id', workerId)
      .single()) as SupabaseSingleResponse<SupabaseApplicationRow>;

    if (selectError && selectError.code !== 'PGRST116') {
      throw new InternalServerErrorException(
        'Unable to verify existing application',
      );
    }

    if (existingApplication) {
      return this.mapToResponse(existingApplication);
    }

    const { data: createdApplication, error: insertError } = (await client
      .from('applications')
      .insert({
        job_id: jobId,
        worker_id: workerId,
        status: 'pending',
        message: message ?? null,
      })
      .select()
      .single()) as SupabaseSingleResponse<SupabaseApplicationRow>;

    if (insertError || !createdApplication) {
      throw new InternalServerErrorException('Unable to create application');
    }

    return this.mapToResponse(createdApplication);
  }

  async accept(
    id: string,
    requesterId: string,
  ): Promise<ApplicationResponseDto> {
    const application = await this.getApplication(id);
    const job = await this.getJob(application.job_id);

    if (job.client_id !== requesterId) {
      throw new ForbiddenException(
        'Only the job owner can accept applications',
      );
    }

    if (application.status !== 'pending') {
      throw new ForbiddenException('Only pending applications can be accepted');
    }

    const { data: updatedApplication, error } = (await this.supabaseService
      .getClient()
      .from('applications')
      .update({ status: 'accepted' })
      .eq('id', id)
      .select()
      .single()) as SupabaseSingleResponse<SupabaseApplicationRow>;

    if (error || !updatedApplication) {
      throw new InternalServerErrorException('Unable to accept application');
    }

    const { data: updatedJob, error: jobError } = (await this.supabaseService
      .getClient()
      .from('jobs')
      .update({ status: 'assigned', assigned_worker_id: application.worker_id })
      .eq('id', application.job_id)
      .select()
      .single()) as SupabaseSingleResponse<SupabaseJobRow>;

    if (jobError || !updatedJob) {
      throw new InternalServerErrorException('Unable to assign worker to job');
    }

    return this.mapToResponse(updatedApplication);
  }

  async reject(
    id: string,
    requesterId: string,
  ): Promise<ApplicationResponseDto> {
    const application = await this.getApplication(id);
    const job = await this.getJob(application.job_id);

    if (job.client_id !== requesterId) {
      throw new ForbiddenException(
        'Only the job owner can reject applications',
      );
    }

    if (application.status !== 'pending') {
      throw new ForbiddenException('Only pending applications can be rejected');
    }

    const { data: updatedApplication, error } = (await this.supabaseService
      .getClient()
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single()) as SupabaseSingleResponse<SupabaseApplicationRow>;

    if (error || !updatedApplication) {
      throw new InternalServerErrorException('Unable to reject application');
    }

    return this.mapToResponse(updatedApplication);
  }

  async findMine(workerId: string): Promise<ApplicationResponseDto[]> {
    const { data: applications, error } = (await this.supabaseService
      .getClient()
      .from('applications')
      .select('*')
      .eq(
        'worker_id',
        workerId,
      )) as SupabaseListResponse<SupabaseApplicationRow>;

    if (error) {
      throw new InternalServerErrorException('Unable to fetch applications');
    }

    return (applications ?? []).map((application) =>
      this.mapToResponse(application),
    );
  }

  private async getApplication(id: string): Promise<SupabaseApplicationRow> {
    const { data: application, error } = (await this.supabaseService
      .getClient()
      .from('applications')
      .select('*')
      .eq('id', id)
      .single()) as SupabaseSingleResponse<SupabaseApplicationRow>;

    if (error || !application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  private async getJob(jobId: string): Promise<SupabaseJobRow> {
    const { data: job, error } = (await this.supabaseService
      .getClient()
      .from('jobs')
      .select('id, client_id, status')
      .eq('id', jobId)
      .single()) as SupabaseSingleResponse<SupabaseJobRow>;

    if (error || !job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  private mapToResponse(
    application: SupabaseApplicationRow,
  ): ApplicationResponseDto {
    return {
      id: application.id,
      jobId: application.job_id,
      workerId: application.worker_id,
      status: application.status,
      message: application.message,
      createdAt: application.created_at,
    };
  }
}
