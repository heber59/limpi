import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';

type SupabaseSingleResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};

interface SupabaseReviewRow {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface SupabaseJobRow {
  id: string;
  client_id: string;
  assigned_worker_id: string | null;
  status: string;
}

@Injectable()
export class ReviewsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(
    createReviewDto: CreateReviewDto,
    reviewerId: string,
  ): Promise<ReviewResponseDto> {
    const client = this.supabaseService.getClient();

    const { data: job, error: jobError } = (await client
      .from('jobs')
      .select('id, client_id, assigned_worker_id, status')
      .eq('id', createReviewDto.jobId)
      .single()) as SupabaseSingleResponse<SupabaseJobRow>;

    if (jobError || !job) {
      throw new NotFoundException('Job not found');
    }

    const validReviewer =
      reviewerId === job.client_id || reviewerId === job.assigned_worker_id;

    if (!validReviewer) {
      throw new ForbiddenException('Reviewer is not part of this job');
    }

    if (job.status !== 'done') {
      throw new ForbiddenException(
        'Reviews are only allowed on completed jobs',
      );
    }

    const validReviewed =
      (reviewerId === job.client_id &&
        createReviewDto.reviewedId === job.assigned_worker_id) ||
      (reviewerId === job.assigned_worker_id &&
        createReviewDto.reviewedId === job.client_id);

    if (!validReviewed) {
      throw new ForbiddenException(
        'Reviewed user must be the other job participant',
      );
    }

    const { data: review, error: insertError } = (await client
      .from('reviews')
      .insert({
        job_id: createReviewDto.jobId,
        reviewer_id: reviewerId,
        reviewed_id: createReviewDto.reviewedId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment ?? null,
      })
      .select()
      .single()) as SupabaseSingleResponse<SupabaseReviewRow>;

    if (insertError || !review) {
      throw new InternalServerErrorException('Unable to create review');
    }

    return this.mapToResponse(review);
  }

  private mapToResponse(review: SupabaseReviewRow): ReviewResponseDto {
    return {
      id: review.id,
      jobId: review.job_id,
      reviewerId: review.reviewer_id,
      reviewedId: review.reviewed_id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
    };
  }
}
