# LIMPI

App mobile tipo marketplace para servicios de aseo.

## Descripción

LIMPI conecta:

* Clientes que necesitan servicios de limpieza
* Trabajadoras que buscan trabajos

El cliente publica un trabajo, las trabajadoras se postulan y el cliente elige con quién trabajar.

---

## Flujo principal

```
Cliente publica trabajo
Trabajadoras ven trabajos
Trabajadora se postula
Cliente elige trabajadora
Chat para coordinar
Se realiza el trabajo
Ambos se califican
```

---

## Stack

* Mobile: Flutter
* Backend: NestJS
* Base de datos: PostgreSQL
* Auth & servicios: Firebase

---

## Estructura del proyecto

```
/backend
/mobile
/docs
```

---

## Estado del proyecto

Backend implementado:

* [x] Diseño de arquitectura
* [x] Diseño de base de datos
* [x] Backend
* [ ] App móvil
* [ ] Deploy

---

## Documentación disponible

* API docs: `http://localhost:3000/docs`
* API base: `http://localhost:3000/api/v1`

---

## Objetivo MVP

Validar que:

* Clientes publiquen trabajos
* Trabajadoras se postulen
* Se completen servicios reales
