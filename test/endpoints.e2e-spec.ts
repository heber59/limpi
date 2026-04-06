import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import type { Server } from 'http';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
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

interface TestRequest extends ExpressRequest {
  user?: typeof mockUser;
}

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<TestRequest>();
    request.user = mockUser;
    return true;
  }
}

const authServiceMock = {
  getMe: jest.fn<() => Promise<typeof mockUser>>().mockResolvedValue({
    ...mockUser,
  }),
  register: jest.fn<() => Promise<typeof mockUser>>().mockResolvedValue({
    ...mockUser,
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
  create: jest
    .fn<() => Promise<typeof jobResponse>>()
    .mockResolvedValue(jobResponse),
  findAll: jest
    .fn<() => Promise<(typeof jobResponse)[]>>()
    .mockResolvedValue([jobResponse]),
  findOne: jest
    .fn<() => Promise<typeof jobResponse>>()
    .mockResolvedValue(jobResponse),
  update: jest
    .fn<() => Promise<typeof jobResponse>>()
    .mockResolvedValue(jobResponse),
  cancel: jest
    .fn<() => Promise<typeof jobResponse>>()
    .mockResolvedValue(jobResponse),
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
  apply: jest
    .fn<() => Promise<typeof applicationResponse>>()
    .mockResolvedValue(applicationResponse),
  accept: jest
    .fn<() => Promise<typeof applicationResponse>>()
    .mockResolvedValue(applicationResponse),
  reject: jest
    .fn<() => Promise<typeof applicationResponse>>()
    .mockResolvedValue(applicationResponse),
  findMine: jest
    .fn<() => Promise<(typeof applicationResponse)[]>>()
    .mockResolvedValue([applicationResponse]),
};

const messageResponse = {
  id: 'message-1',
  jobId: jobResponse.id,
  senderId: mockUser.id,
  message: 'Hola, estoy en camino',
  createdAt: new Date().toISOString(),
};

const chatServiceMock = {
  findMessages: jest
    .fn<() => Promise<(typeof messageResponse)[]>>()
    .mockResolvedValue([messageResponse]),
  sendMessage: jest
    .fn<() => Promise<typeof messageResponse>>()
    .mockResolvedValue(messageResponse),
};

const notificationResponse = {
  id: 'notification-1',
  userId: mockUser.id,
  token: 'device-token-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const notificationsServiceMock = {
  registerToken: jest
    .fn<() => Promise<typeof notificationResponse>>()
    .mockResolvedValue(notificationResponse),
};

describe('API Endpoints (e2e)', () => {
  let app: INestApplication;
  let server: Server;

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
    server = app.getHttpServer() as unknown as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/me (GET) returns current user', async () => {
    await request(server)
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
    await request(server)
      .post('/jobs')
      .send({
        title: 'Limpieza de casa',
        description: 'Casa pequeña',
        location: 'Centro',
        budget: 80,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: jobResponse.id,
          title: jobResponse.title,
        });
      });
  });

  it('/jobs (GET) returns jobs list', async () => {
    await request(server)
      .get('/jobs')
      .expect(200)
      .expect((res) => {
        const body = res.body as Array<{ id: string }>;
        expect(Array.isArray(body)).toBe(true);
        expect(body[0]).toMatchObject({ id: jobResponse.id });
      });
  });

  it('/jobs/:id (GET) returns one job', async () => {
    await request(server)
      .get(`/jobs/${jobResponse.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({ id: jobResponse.id });
      });
  });

  it('/jobs/:id/cancel (POST) cancels a job', async () => {
    await request(server)
      .post(`/jobs/${jobResponse.id}/cancel`)
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({ id: jobResponse.id });
      });
  });

  it('/jobs/:id/apply (POST) creates an application', async () => {
    await request(server)
      .post(`/jobs/${jobResponse.id}/apply`)
      .send({ message: 'Quiero postularme' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: applicationResponse.id,
          jobId: applicationResponse.jobId,
        });
      });
  });

  it('/applications/:id/accept (POST) accepts an application', async () => {
    await request(server)
      .post(`/applications/${applicationResponse.id}/accept`)
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({ id: applicationResponse.id });
      });
  });

  it('/applications/:id/reject (POST) rejects an application', async () => {
    await request(server)
      .post(`/applications/${applicationResponse.id}/reject`)
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({ id: applicationResponse.id });
      });
  });

  it('/my-applications (GET) returns current user applications', async () => {
    await request(server)
      .get('/my-applications')
      .expect(200)
      .expect((res) => {
        const body = res.body as Array<{ id: string }>;
        expect(Array.isArray(body)).toBe(true);
        expect(body[0]).toMatchObject({ id: applicationResponse.id });
      });
  });

  it('/jobs/:id/messages (GET) returns messages for a job', async () => {
    await request(server)
      .get(`/jobs/${jobResponse.id}/messages`)
      .expect(200)
      .expect((res) => {
        const body = res.body as Array<{ id: string }>;
        expect(Array.isArray(body)).toBe(true);
        expect(body[0]).toMatchObject({ id: messageResponse.id });
      });
  });

  it('/jobs/:id/messages (POST) sends a message', async () => {
    await request(server)
      .post(`/jobs/${jobResponse.id}/messages`)
      .send({ message: 'Hola, ¿estás disponible?' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({ id: messageResponse.id });
      });
  });

  it('/notifications/token (POST) registers a device token', async () => {
    await request(server)
      .post('/notifications/token')
      .send({ token: notificationResponse.token })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: notificationResponse.id,
          token: notificationResponse.token,
        });
      });
  });
});
