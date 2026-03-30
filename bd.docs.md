# Base de Datos – MVP App Servicios de Aseo

## Descripción General

Esta base de datos soporta un marketplace donde:

* Clientes publican trabajos de aseo
* Trabajadoras se postulan a trabajos
* El cliente elige una trabajadora
* Ambas partes pueden chatear
* Al finalizar se califican

Base de datos relacional: **PostgreSQL**

---

# Diagrama lógico (relaciones)

```
users 1 --- n jobs
users 1 --- n applications
jobs 1 --- n applications
jobs 1 --- n messages
jobs 1 --- n reviews
jobs 1 --- 1 assigned_worker (users)
```

---

# Tabla: users

Almacena todos los usuarios (clientes y trabajadoras).

| Campo              | Tipo      | Descripción                |
| ------------------ | --------- | -------------------------- |
| id                 | UUID      | ID del usuario             |
| firebase_uid       | VARCHAR   | ID del usuario en Firebase |
| name               | VARCHAR   | Nombre                     |
| phone              | VARCHAR   | Teléfono                   |
| role               | VARCHAR   | 'client' o 'worker'        |
| profile_photo_url  | TEXT      | URL foto de perfil         |
| document_photo_url | TEXT      | URL documento              |
| rating             | DECIMAL   | Promedio de calificaciones |
| rating_count       | INT       | Número de calificaciones   |
| is_verified        | BOOLEAN   | Usuario verificado         |
| created_at         | TIMESTAMP | Fecha de creación          |

---

# Tabla: jobs

Trabajos publicados por los clientes.

| Campo              | Tipo      | Descripción          |
| ------------------ | --------- | -------------------- |
| id                 | UUID      | ID del trabajo       |
| client_id          | UUID      | Cliente que publica  |
| title              | VARCHAR   | Título del trabajo   |
| description        | TEXT      | Descripción          |
| address            | TEXT      | Dirección            |
| date               | DATE      | Fecha del trabajo    |
| start_time         | TIME      | Hora de inicio       |
| hours              | INT       | Duración estimada    |
| price              | DECIMAL   | Precio ofrecido      |
| status             | VARCHAR   | Estado del trabajo   |
| assigned_worker_id | UUID      | Trabajadora asignada |
| created_at         | TIMESTAMP | Fecha creación       |

## Estados de job

| Estado      | Descripción          |
| ----------- | -------------------- |
| open        | Publicado            |
| assigned    | Trabajadora asignada |
| in_progress | En progreso          |
| done        | Terminado            |
| cancelled   | Cancelado            |

---

# Tabla: applications

Postulaciones de trabajadoras a trabajos.

| Campo      | Tipo      | Descripción           |
| ---------- | --------- | --------------------- |
| id         | UUID      | ID de postulación     |
| job_id     | UUID      | Trabajo               |
| worker_id  | UUID      | Trabajadora           |
| status     | VARCHAR   | Estado de postulación |
| message    | TEXT      | Mensaje inicial       |
| created_at | TIMESTAMP | Fecha                 |

## Estados de application

| Estado   | Descripción |
| -------- | ----------- |
| pending  | Postulada   |
| accepted | Aceptada    |
| rejected | Rechazada   |

Restricción:

* Una trabajadora solo puede postularse una vez por trabajo.

---

# Tabla: messages

Chat entre cliente y trabajadoras por trabajo.

| Campo      | Tipo      | Descripción       |
| ---------- | --------- | ----------------- |
| id         | UUID      | ID mensaje        |
| job_id     | UUID      | Trabajo           |
| sender_id  | UUID      | Usuario que envía |
| message    | TEXT      | Mensaje           |
| created_at | TIMESTAMP | Fecha             |

El chat pertenece al trabajo, no a la postulación.

---

# Tabla: reviews

Calificaciones después de terminar el trabajo.

| Campo       | Tipo      | Descripción               |
| ----------- | --------- | ------------------------- |
| id          | UUID      | ID review                 |
| job_id      | UUID      | Trabajo                   |
| reviewer_id | UUID      | Quien califica            |
| reviewed_id | UUID      | Quien recibe calificación |
| rating      | INT       | Calificación (1–5)        |
| comment     | TEXT      | Comentario                |
| created_at  | TIMESTAMP | Fecha                     |

Cada trabajo debe generar:

* Cliente califica trabajadora
* Trabajadora califica cliente

---

# Índices (Performance)

```sql
CREATE INDEX idx_jobs_client ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_date ON jobs(date);

CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_worker ON applications(worker_id);

CREATE INDEX idx_messages_job ON messages(job_id);
```

---

# Flujo del sistema

```
1. Usuario se registra → users
2. Cliente publica trabajo → jobs (status=open)
3. Trabajadoras ven trabajos
4. Trabajadora se postula → applications
5. Cliente chatea con trabajadoras → messages
6. Cliente acepta trabajadora:
      applications.status = accepted
      jobs.assigned_worker_id = worker_id
      jobs.status = assigned
7. Se realiza trabajo → jobs.status = done
8. Ambos califican → reviews
```

---

# Preparado para futuras mejoras

Posibles tablas futuras:

* payments
* notifications
* reports (reportar usuarios)
* favorites (trabajadoras favoritas)
* availability (disponibilidad trabajadoras)

Posible mejora futura:
Agregar ubicación:

```sql
ALTER TABLE jobs ADD COLUMN latitude DECIMAL(10,8);
ALTER TABLE jobs ADD COLUMN longitude DECIMAL(11,8);
```

---

# Resumen

Esta base de datos permite el funcionamiento completo del MVP:

* Registro de usuarios
* Publicación de trabajos
* Postulaciones
* Selección de trabajadora
* Chat
* Finalización de trabajo
* Calificaciones

```
```
