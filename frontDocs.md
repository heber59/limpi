# Limpi — Plan de Pantallas Flutter MVP

## Contexto del frontend

- Framework: Flutter (Dart)
- Plataforma inicial: Android
- Estilo visual: Minimalista y limpio
- Stack:
  - Riverpod → manejo de estado
  - Dio → llamadas HTTP
  - Firebase Auth → login
  - Go Router → navegación
  - Freezed → modelos de datos

---

## Flujo de autenticación (ambos roles)

```
Splash
  └── Login (email + contraseña)
        └── Registro
              └── Completar perfil (nombre, teléfono, rol)
```

---

## Flujo Cliente

```
Home Cliente
  ├── Publicar trabajo
  │     └── Confirmación publicación
  ├── Mis trabajos
  │     └── Detalle trabajo
  │           ├── Ver postulaciones
  │           │     └── Perfil trabajadora
  │           │           └── Aceptar trabajadora
  │           ├── Chat
  │           └── Calificar (cuando status = done)
  └── Mi perfil
```

---

## Flujo Trabajadora

```
Home Trabajadora
  ├── Lista de trabajos disponibles
  │     └── Detalle trabajo
  │           ├── Postularse
  │           └── Chat (si fue aceptada)
  ├── Mis postulaciones
  │     └── Detalle trabajo asignado
  │           ├── Chat
  │           └── Calificar (cuando status = done)
  └── Mi perfil
```

---

## Pantallas en total

| # | Pantalla | Rol |
|---|----------|-----|
| 1 | Splash | Ambos |
| 2 | Login | Ambos |
| 3 | Registro | Ambos |
| 4 | Completar perfil | Ambos |
| 5 | Home Cliente | Cliente |
| 6 | Publicar trabajo | Cliente |
| 7 | Mis trabajos | Cliente |
| 8 | Detalle trabajo (cliente) | Cliente |
| 9 | Ver postulaciones | Cliente |
| 10 | Perfil trabajadora | Cliente |
| 11 | Home Trabajadora | Trabajadora |
| 12 | Lista trabajos disponibles | Trabajadora |
| 13 | Detalle trabajo (trabajadora) | Trabajadora |
| 14 | Mis postulaciones | Trabajadora |
| 15 | Chat | Ambos |
| 16 | Calificar | Ambos |
| 17 | Mi perfil | Ambos |

**17 pantallas para el MVP completo.**

---

## Navegación por roles

```
Login exitoso
  ├── role = client  → Home Cliente
  └── role = worker  → Home Trabajadora
```

---

## Conexión con el backend

- Base URL: `http://localhost:3000/api/v1` (desarrollo)
- Autenticación: `Authorization: Bearer <firebase_token>`
- El token se obtiene de Firebase Auth después del login
- Todos los endpoints protegidos requieren el header Bearer

---

## Endpoints que consume el frontend

### Auth
```
GET  /auth/me
POST /auth/register
```

### Users
```
GET   /users/:id
PATCH /users/:id
```

### Jobs
```
POST  /jobs
GET   /jobs
GET   /jobs/:id
PATCH /jobs/:id
POST  /jobs/:id/cancel
```

### Applications
```
POST /jobs/:id/apply
POST /applications/:id/accept
POST /applications/:id/reject
GET  /my-applications
```

### Reviews
```
POST /reviews
```

### Chat
```
GET  /jobs/:id/messages
POST /jobs/:id/messages
```

### Notifications
```
POST /notifications/token
```

---

## Estructura de carpetas Flutter (recomendada)

```
lib/
  core/
    constants/         → colores, strings, tamaños
    network/           → cliente Dio, interceptors
    router/            → GoRouter, rutas
    theme/             → tema global de la app
  features/
    auth/
      data/            → repositorio, modelos
      presentation/    → pantallas y widgets
      providers/       → Riverpod providers
    jobs/
      data/
      presentation/
      providers/
    applications/
      data/
      presentation/
      providers/
    chat/
      data/
      presentation/
      providers/
    reviews/
      data/
      presentation/
      providers/
    profile/
      data/
      presentation/
      providers/
  shared/
    widgets/           → widgets reutilizables
    extensions/        → extensiones de Dart
main.dart
```

---

## Orden de desarrollo sugerido

1. Proyecto Flutter creado y dependencias instaladas
2. Tema visual y constantes de diseño
3. Módulo auth (Splash → Login → Registro → Completar perfil)
4. Navegación por roles (GoRouter)
5. Home Cliente + Publicar trabajo
6. Home Trabajadora + Lista trabajos
7. Postulaciones (postularse, aceptar, rechazar)
8. Chat
9. Calificaciones
10. Mi perfil