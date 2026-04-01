import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../src/modules/auth/auth.controller';
import { JobsController } from '../src/modules/jobs/jobs.controller';
import { ApplicationsController } from '../src/modules/applications/applications.controller';
import { ChatController } from '../src/modules/chat/chat.controller';
import { NotificationsController } from '../src/modules/notifications/notifications.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { JobsService } from '../src/modules/jobs/jobs.service';
import { ApplicationsService } from '../src/modules/applications/applications.service';
import { ChatService } from '../src/modules/chat/chat.service';
import { NotificationsService } from '../src/modules/notifications/notifications.service';
import { FirebaseAuthGuard } from '../src/common/guards/firebase-auth.guard';

const mockUser = {
  id: 'user-1',
  firebase_uid: 'firebase-uid-1',
  name: 'Test User',
  phone: '1234567890',
  role: 'client',
  profile_photo_url: null,
  document_photo_url: null,
  rating: 4.8,
  rating_count: 12,
  is_verified: true,
  created_at: new Date().toISOString(),
};

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = mockUser;
    return true;
  }
}

const authServiceMock = {
  getMe: jest.fn().mockResolvedValue({
    ...mockUser,
    id: mockUser.id,
    firebase_uid: mockUser.firebase_uid,
  }),
  register: jest.fn().mockResolvedValue({
    ...mockUser,
    id: mockUser.id,
    firebase_uid: mockUser.firebase_uid,
  }),
};

const jobResponse = {
  id: 'job-1',
  clientId: mockUser.id,
  title: 'Limpieza de oficina',
  description: 'Limpiar 3 habitaciones y sala',
  location: 'Ciudad',
  budget: 120,
  status: 'open',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const jobsServiceMock = {
  create: jest.fn().mockResolvedValue(jobResponse),
  findAll: jest.fn().mockResolvedValue([jobResponse]),
  findOne: jest.fn().mockResolvedValue(jobResponse),
  update: jest.fn().mockResolvedValue(jobResponse),
  cancel: jest.fn().mockResolvedValue(jobResponse),
};

const applicationResponse = {
  id: 'application-1',
  jobId: jobResponse.id,
  workerId: 'worker-1',
  message: 'Estoy interesada',
  status: 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const applicationsServiceMock = {
  apply: jest.fn().mockResolvedValue(applicationResponse),
  accept: jest.fn().mockResolvedValue(applicationResponse),
  reject: jest.fn().mockResolvedValue(applicationResponse),
  findMine: jest.fn().mockResolvedValue([applicationResponse]),
};

const messageResponse = {
  id: 'message-1',
  jobId: jobResponse.id,
  senderId: mockUser.id,
  message: 'Hola, estoy en camino',
  createdAt: new Date().toISOString(),
};

const chatServiceMock = {
  findMessages: jest.fn().mockResolvedValue([messageResponse]),
  sendMessage: jest.fn().mockResolvedValue(messageResponse),
};

const notificationResponse = {
  id: 'notification-1',
  userId: mockUser.id,
  token: 'device-token-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const notificationsServiceMock = {
  registerToken: jest.fn().mockResolvedValue(notificationResponse),
};

describe('API Endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        AuthController,
        JobsController,
        ApplicationsController,
        ChatController,
        NotificationsController,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: JobsService, useValue: jobsServiceMock },
        { provide: ApplicationsService, useValue: applicationsServiceMock },
        { provide: ChatService, useValue: chatServiceMock },
        { provide: NotificationsService, useValue: notificationsServiceMock },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/me (GET) returns current user', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: mockUser.id,
          firebase_uid: mockUser.firebase_uid,
        });
      });
  });

  it('/jobs (POST) creates a job', async () => {
    await request(app.getHttpServer())
      .post('/jobs')
      .send({
        title: 'Limpieza de casa',
        description: 'Casa pequeña',
        location: 'Centro',
        budget: 80,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({ id: jobResponse.id, title: jobResponse.title });
      });
  });

  it('/jobs (GET) returns jobs list', async () => {
    await request(app.getHttpServer())
      .get('/jobs')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toMatchObject({ id: jobResponse.id });
      });
  });

  it('/jobs/:id (GET) returns one job', async () => {
    await request(app.getHttpServer())
      .get(`/jobs/${jobResponse.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({ id: jobResponse.id });
      });
  });

  it('/jobs/:id/cancel (POST) cancels a job', async () => {
    await request(app.getHttpServer())
      .post(`/jobs/${jobResponse.id}/cancel`)
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({ id: jobResponse.id });
      });
  });

  it('/jobs/:id/apply (POST) creates an application', async () => {
    await request(app.getHttpServer())
      .post(`/jobs/${jobResponse.id}/apply`)
      .send({ message: 'Quiero postularme' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({ id: applicationResponse.id, jobId: applicationResponse.jobId });
      });
  });

  it('/applications/:id/accept (POST) accepts an application', async () => {
    await request(app.getHttpServer())
      .post(`/applications/${applicationResponse.id}/accept`)
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({ id: applicationResponse.id });
      });
  });

  it('/applications/:id/reject (POST) rejects an application', async () => {
    await request(app.getHttpServer())
      .post(`/applications/${applicationResponse.id}/reject`)
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({ id: applicationResponse.id });
      });
  });

  it('/my-applications (GET) returns current user applications', async () => {
    await request(app.getHttpServer())
      .get('/my-applications')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toMatchObject({ id: applicationResponse.id });
      });
  });

  it('/jobs/:id/messages (GET) returns messages for a job', async () => {
    await request(app.getHttpServer())
      .get(`/jobs/${jobResponse.id}/messages`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toMatchObject({ id: messageResponse.id });
      });
  });

  it('/jobs/:id/messages (POST) sends a message', async () => {
    await request(app.getHttpServer())
      .post(`/jobs/${jobResponse.id}/messages`)
      .send({ message: 'Hola, ¿estás disponible?' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({ id: messageResponse.id });
      });
  });

  it('/notifications/token (POST) registers a device token', async () => {
    await request(app.getHttpServer())
      .post('/notifications/token')
      .send({ token: notificationResponse.token })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({ id: notificationResponse.id, token: notificationResponse.token });
      });
  });
});
