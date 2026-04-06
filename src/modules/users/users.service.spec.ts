import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

interface MockSupabaseClient {
  from: jest.MockedFunction<() => MockSupabaseClient>;
  select: jest.MockedFunction<() => MockSupabaseClient>;
  eq: jest.MockedFunction<() => MockSupabaseClient>;
  single: jest.MockedFunction<() => Promise<{ data: unknown; error: unknown }>>;
  insert: jest.MockedFunction<() => MockSupabaseClient>;
  update: jest.MockedFunction<() => MockSupabaseClient>;
}

describe('UsersService', () => {
  let service: UsersService;
  let mockClient: MockSupabaseClient;

  beforeEach(async () => {
    mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    } as unknown as MockSupabaseClient;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => mockClient,
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should create a new user when no existing firebase user exists', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      phone: '555-1234',
      role: 'client',
      profilePhotoUrl: undefined,
      documentPhotoUrl: undefined,
    };

    const insertedUser = {
      id: 'user-1',
      firebase_uid: 'firebase-123',
      name: 'Test User',
      phone: '555-1234',
      role: 'client',
      profile_photo_url: null,
      document_photo_url: null,
      rating: null,
      rating_count: 0,
      is_verified: false,
      created_at: '2026-03-31T00:00:00.000Z',
    };

    mockClient.single
      .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
      .mockResolvedValueOnce({ data: insertedUser, error: null });

    const result = await service.create(createUserDto, 'firebase-123');

    expect(result).toEqual({
      id: insertedUser.id,
      name: insertedUser.name,
      phone: insertedUser.phone,
      role: insertedUser.role,
      profilePhotoUrl: null,
      documentPhotoUrl: null,
      rating: null,
      ratingCount: insertedUser.rating_count,
      isVerified: insertedUser.is_verified,
      createdAt: insertedUser.created_at,
    });
    expect(mockClient.from).toHaveBeenCalledWith('users');
  });
});
