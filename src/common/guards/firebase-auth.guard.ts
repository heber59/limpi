import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { FirebaseService } from '../../firebase/firebase.service';
import { SupabaseService } from '../../supabase/supabase.service';
import type { Request } from 'express';

interface SupabaseUser {
  id: string;
  firebase_uid: string;
  name: string;
  phone: string;
  role: 'client' | 'worker';
  profile_photo_url: string | null;
  document_photo_url: string | null;
  rating: number | null;
  rating_count: number;
  is_verified: boolean;
  created_at: string;
}

interface RequestWithUser extends Request {
  user?: SupabaseUser;
}

interface SupabaseSingleResponse<T> {
  data: T | null;
  error: { code: string } | null;
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithUser>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authorization.split(' ')[1];
    let decodedToken: DecodedIdToken;

    try {
      decodedToken = await this.firebaseService.getAuth().verifyIdToken(token);
    } catch {
      throw new UnauthorizedException('Invalid Firebase token');
    }

    const firebaseUid = decodedToken.uid;
    const { data: user, error } = (await this.supabaseService
      .getClient()
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single()) as SupabaseSingleResponse<SupabaseUser>;

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    request.user = user;
    return true;
  }
}
