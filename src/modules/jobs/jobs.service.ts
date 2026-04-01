import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobResponseDto } from './dto/job-response.dto';

type JobStatus = 'open' | 'assigned' | 'in_progress' | 'done' | 'cancelled';

interface SupabaseJobRow {
  id: string;
  client_id: string;
  title: string;
  description: string;
  address: string;
  date: string;
  start_time: string;
  hours: number;
  price: number;
  status: JobStatus;
  assigned_worker_id: string | null;
  created_at: string;
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
export class JobsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(
    createJobDto: CreateJobDto,
    clientId: string,
  ): Promise<JobResponseDto> {
    const client = this.supabaseService.getClient();

    const { data: createdJob, error } =
      (await client
        .from('jobs')
        .insert({
          client_id: clientId,
          title: createJobDto.title,
          description: createJobDto.description,
          address: createJobDto.address,
          date: createJobDto.date,
          start_time: createJobDto.startTime,
          hours: createJobDto.hours,
          price: createJobDto.price,
          status: createJobDto.status ?? 'open',
        })
        .select()
        .single()) as SupabaseSingleResponse<SupabaseJobRow>;

    if (error || !createdJob) {
      throw new InternalServerErrorException('Unable to create job');
    }

    return this.mapToResponse(createdJob);
  }

  async findAll(): Promise<JobResponseDto[]> {
    const { data: jobs, error } =
      (await this.supabaseService
        .getClient()
        .from('jobs')
        .select('*')) as SupabaseListResponse<SupabaseJobRow>;

    if (error) {
      throw new InternalServerErrorException('Unable to fetch jobs');
    }

    return (jobs ?? []).map((job) => this.mapToResponse(job));
  }

  async findOne(id: string): Promise<JobResponseDto> {
    const { data: job, error } =
      (await this.supabaseService
        .getClient()
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()) as SupabaseSingleResponse<SupabaseJobRow>;

    if (error || !job) {
      throw new NotFoundException('Job not found');
    }

    return this.mapToResponse(job);
  }

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
    requesterId: string,
  ): Promise<JobResponseDto> {
    const job = await this.findOne(id);

    if (job.clientId !== requesterId) {
      throw new ForbiddenException('Only the job creator can update this job');
    }

    const updatePayload: Partial<SupabaseJobRow> = {
      title: updateJobDto.title,
      description: updateJobDto.description,
      address: updateJobDto.address,
      date: updateJobDto.date,
      start_time: updateJobDto.startTime,
      hours: updateJobDto.hours,
      price: updateJobDto.price,
      status: updateJobDto.status,
    };

    const { data: updatedJob, error } =
      (await this.supabaseService
        .getClient()
        .from('jobs')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()) as SupabaseSingleResponse<SupabaseJobRow>;

    if (error || !updatedJob) {
      throw new InternalServerErrorException('Unable to update job');
    }

    return this.mapToResponse(updatedJob);
  }

  async cancel(id: string, requesterId: string): Promise<JobResponseDto> {
    const job = await this.findOne(id);

    if (job.clientId !== requesterId) {
      throw new ForbiddenException('Only the job creator can cancel this job');
    }

    const { data: cancelledJob, error } =
      (await this.supabaseService
        .getClient()
        .from('jobs')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single()) as SupabaseSingleResponse<SupabaseJobRow>;

    if (error || !cancelledJob) {
      throw new InternalServerErrorException('Unable to cancel job');
    }

    return this.mapToResponse(cancelledJob);
  }

  private mapToResponse(job: SupabaseJobRow): JobResponseDto {
    return {
      id: job.id,
      clientId: job.client_id,
      title: job.title,
      description: job.description,
      address: job.address,
      date: job.date,
      startTime: job.start_time,
      hours: job.hours,
      price: job.price,
      status: job.status,
      assignedWorkerId: job.assigned_worker_id,
      createdAt: job.created_at,
    };
  }
}
