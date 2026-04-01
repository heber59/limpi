# limpi

# Plan en 3 Steps – App de Servicios de Aseo (MVP)

---

# STEP 1 — Infraestructura base (Firebase + DB + Backend corriendo)

**Objetivo:** que exista la base técnica y autenticación funcionando.

## 1.1 Crear proyecto en Firebase

Activar:

* Authentication
* Cloud Messaging
* Storage

 Authentication:

* Login con email

---

## 1.2 Base de datos PostgreSQL

Crear DB en:

* Supabase

Crear tablas iniciales:

### users

```
id
firebase_uid
name
phone
role (client | worker)
rating
created_at
```

### jobs

```
id
client_id
title
description
address
date
hours
price
status (open, taken, done, cancelled)
worker_id
created_at
```

### applications

```
id
job_id
worker_id
status (pending, accepted, rejected)
created_at
```

### reviews

```
id
job_id
reviewer_id
reviewed_id
rating
comment
```

### messages

```
id
job_id
sender_id
message
created_at
```

---

## 1.3 Backend en NestJS

Módulos:

```
auth
users
jobs
applications
reviews
chat
notifications
```

Lo importante aquí:

* login Firebase
* NestJS verifica el token de Firebase y lee el usuario de Supabase
* API con prefijo global `/api/v1`
* Swagger disponible en `/docs`
* `/` redirige automáticamente a `/docs`

Flujo:

```
App login → Firebase → devuelve token → App llama la API → NestJS verifica token → OK
```

---

# STEP 2 — Backend completo + documentación (Swagger)

**Objetivo:** tener API lista y documentada para que el frontend se conecte fácil.

Usar:

* Swagger (OpenAPI)

Endpoints MVP:

## Auth

```
GET /auth/me
POST /auth/register
```

## Users

```
POST /users
GET /users/:id
PATCH /users/:id
```

## Jobs

```
POST /jobs
GET /jobs
GET /jobs/:id
PATCH /jobs/:id
POST /jobs/:id/cancel
```

## Applications

```
POST /jobs/:id/apply
POST /applications/:id/accept
POST /applications/:id/reject
GET /my-applications
```

## Reviews

```
POST /reviews
```

## Chat

```
GET /jobs/:id/messages
POST /jobs/:id/messages
```

## Notificaciones

```
POST /notifications/token
```

Cuando tengas Swagger funcionando, ya tienes backend profesional.

* Swagger: `/docs`
* API base: `/api/v1`
* `/` redirige a `/docs`

---

# STEP 3 — Frontend Mobile

**Objetivo:** que la gente pueda usar la app.

Framework:

* Flutter

## Pantallas mínimas

### Comunes

* Login
* Registro
* Completar perfil

### Cliente

* Publicar trabajo
* Mis trabajos
* Ver postulaciones
* Elegir trabajadora
* Chat
* Calificar

### Trabajadora

* Lista de trabajos
* Postularse
* Mis trabajos
* Chat
* Calificar


## Publicar app

* Android primero (más fácil)


# Resumen del Roadmap

| Step   | Objetivo                                        |
| ------ | ----------------------------------------------- |
| Step 1 | Infraestructura y autenticación                 |
| Step 2 | Backend completo + API + Swagger                |
| Step 3 | App móvil                                       |
| Step 4 | Publicar y validar con usuarios reales          |

---

# Meta del MVP

El MVP está completo cuando se puede hacer este flujo:

```
Cliente publica trabajo
Trabajadora ve trabajos
Trabajadora se postula
Cliente acepta trabajadora
Se realiza el trabajo
Se marca como terminado
Ambos se califican
```
