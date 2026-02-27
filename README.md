# Gestor de Opiniones — Laboratorio #2

API REST para un sistema de gestión de opiniones desarrollada con Node.js, Express y MongoDB.

---

## Tecnologías

- Node.js + Express
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- express-validator
- helmet + cors + express-rate-limit

---

## Instalación

```bash
git clone <https://github.com/agarcia-2024043/Gestion-de-Opiniones-IN6AM.git>
cd opinions-api
npm install
cp .env.example .env
npm run dev
```

---

## Variables de entorno

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/opinions_db
JWT_SECRET=&35t!0nde0p!n!0n35
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## Endpoints

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/register | Registrar usuario |
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/auth/me | Ver perfil propio |
| PUT | /api/auth/profile | Editar perfil |
| PUT | /api/auth/change-password | Cambiar contraseña |

### Publicaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/posts | Listar publicaciones |
| GET | /api/posts/:id | Ver publicación por ID |
| POST | /api/posts | Crear publicación |
| PUT | /api/posts/:id | Editar publicación |
| DELETE | /api/posts/:id | Eliminar publicación |

### Comentarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/posts/:postId/comments | Listar comentarios |
| POST | /api/posts/:postId/comments | Crear comentario |
| PUT | /api/posts/:postId/comments/:id | Editar comentario |
| DELETE | /api/posts/:postId/comments/:id | Eliminar comentario |

> Las rutas de crear, editar y eliminar requieren token en el header:
> `Authorization: Bearer <token>`

---

## Categorías disponibles

`Tecnología` `Política` `Deportes` `Entretenimiento` `Ciencia` `Salud` `Educación` `Economía` `Cultura` `Otros`

---

## Control de versiones

| Rama | Descripción |
|------|-------------|
| GOS-001 | Autenticación y perfil de usuario |
| GOS-002 | Gestión de publicaciones |
| GOS-003 | Comentarios y mejoras finales |

---

## Seguridad

- Contraseñas encriptadas con bcrypt (salt 12)
- Autenticación stateless con JWT
- Headers de seguridad con helmet
- Rate limiting: 100 req / 15 min general, 10 req / 15 min en login
- Validaciones en todas las rutas
- Solo el autor puede editar o eliminar su propio contenido
- No se permite la eliminación de usuarios
