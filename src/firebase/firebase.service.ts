import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    if (admin.apps.length) return;

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.config.get<string>('firebase.projectId'),
        clientEmail: this.config.get<string>('firebase.clientEmail'),
        privateKey: this.config.get<string>('firebase.privateKey'),
      }),
    });
  }

  getAuth(): admin.auth.Auth {
    return admin.auth();
  }
}
