# Limpi Backend - Next Steps

## Estado actual

- Backend NestJS inicializado en el root del proyecto.
- `src/main.ts` ya tiene:
  - `app.setGlobalPrefix('api/v1')`
  - Global `ValidationPipe` con `whitelist`, `forbidNonWhitelisted` y `transform`.
  - Swagger configurado en `/docs` con bearer auth `firebase-token`.
- `src/app.module.ts` ya importa y usa:
  - `ConfigModule.forRoot({ isGlobal: true })`
  - `SupabaseModule`
  - `FirebaseModule`
  - `AuthModule`
  - `UsersModule`, `JobsModule`, `ApplicationsModule`, `ReviewsModule`, `ChatModule`, `NotificationsModule`
- Módulo `auth` implementado parcialmente:
  - `FirebaseAuthGuard` en `src/common/guards/firebase-auth.guard.ts`
  - `GET /api/v1/auth/me`
  - `POST /api/v1/auth/register`
  - DTOs en `src/modules/auth/dto`
  - Servicio de auth con lógica de registro y mapeo de usuario
- Los demás módulos (`users`, `jobs`, `applications`, `reviews`, `chat`, `notifications`) existen como placeholders y necesitan implementación.

## Qué hacer a continuación

### 1. Completar los módulos restantes

Implementar los módulos con el mismo estilo de NestJS limpio:

- `src/modules/users`
  - `POST /users`
  - `GET /users/:id`
  - `PATCH /users/:id`
- `src/modules/jobs`
  - `POST /jobs`
  - `GET /jobs`
  - `GET /jobs/:id`
  - `PATCH /jobs/:id`
  - `POST /jobs/:id/cancel`
- `src/modules/applications`
  - `POST /jobs/:id/apply`
  - `POST /applications/:id/accept`
  - `POST /applications/:id/reject`
  - `GET /my-applications`
- `src/modules/reviews`
  - `POST /reviews`
- `src/modules/chat`
  - `GET /jobs/:id/messages`
  - `POST /jobs/:id/messages`
- `src/modules/notifications`
  - `POST /notifications/token`

### 2. Usar Supabase para persistencia

En todos los módulos:

- Utilizar `SupabaseService.getClient()`
- No exponer campos internos como `firebase_uid`
- Mapear los campos de la base de datos a DTOs de respuesta
- Manejar errores con excepciones de NestJS
- Validar entradas con `class-validator`
- Documentar con `@nestjs/swagger`

### 3. Ajustar la base de datos si es necesario

Verificar que las tablas en Supabase concuerdan con `bd.docs.md`:

- `users`
- `jobs`
- `applications`
- `messages`
- `reviews`

### 4. Añadir protección de rutas

- Usar `FirebaseAuthGuard` donde haya endpoints protegidos.
- El guard ya verifica el token Firebase y busca el usuario en Supabase.
- Si un endpoint necesita rol, usar el decorator `@Roles()` existente.

### 5. Pruebas y documentación

- Confirmar que Swagger expone correctamente los endpoints.
- Probar `GET /api/v1/auth/me` y `POST /api/v1/auth/register`.
- Añadir descripciones de Swagger en todos los DTOs y controladores.

## Archivos clave

- `src/main.ts`
- `src/app.module.ts`
- `src/common/guards/firebase-auth.guard.ts`
- `src/modules/auth/*`
- `src/modules/users/*`
- `src/modules/jobs/*`
- `src/modules/applications/*`
- `src/modules/reviews/*`
- `src/modules/chat/*`
- `src/modules/notifications/*`
- `src/supabase/supabase.service.ts`
- `src/firebase/firebase.service.ts`
- `README.md`, `proyectAspect.md`, `bd.docs.md`

## Recomendación inmediata

1. Implementar el módulo `users` completo.
2. Crear los DTOs y endpoints para `jobs`.
3. Revisar el flujo de `applications` y `reviews` según `bd.docs.md`.
4. Añadir mensajes y notificaciones una vez estén definidos los casos de uso.
