import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient<any, any, 'public', any, any>;

  constructor(private readonly config: ConfigService) {
    this.client = createClient(
      this.config.get<string>('supabase.url') ?? '',
      this.config.get<string>('supabase.key') ?? '',
    );
  }

  getClient(): SupabaseClient<any, any, 'public', any, any> {
    return this.client;
  }
}
