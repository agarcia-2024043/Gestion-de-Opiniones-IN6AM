#  Gestor de Opiniones — Laboratorio #2

API REST para un sistema de gestión de opiniones con autenticación JWT, construida con **Node.js + Express + MongoDB**.

---

## 📦 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores (especialmente MONGODB_URI y JWT_SECRET)

# 3. Iniciar en desarrollo
npm run dev

# 4. Iniciar en producción
npm start
```

---

## 🔐 Autenticación

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Auth `/api/auth`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/register` | ❌ | Registrar nuevo usuario |
| POST | `/login` | ❌ | Login con correo o username |
| GET | `/me` | ✅ | Ver mi perfil |
| PUT | `/profile` | ✅ | Editar perfil (username, nombre, bio) |
| PUT | `/change-password` | ✅ | Cambiar contraseña (requiere la actual) |

### Posts `/api/posts`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | ❌ | Listar publicaciones (paginado, filtro por categoría) |
| GET | `/:id` | ❌ | Ver publicación + sus comentarios |
| POST | `/` | ✅ | Crear publicación |
| PUT | `/:id` | ✅ | Editar (solo el autor) |
| DELETE | `/:id` | ✅ | Eliminar (solo el autor) |

### Comentarios `/api/posts/:postId/comments`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | ❌ | Ver comentarios del post |
| POST | `/` | ✅ | Comentar |
| PUT | `/:commentId` | ✅ | Editar comentario (solo el autor) |
| DELETE | `/:commentId` | ✅ | Eliminar comentario (solo el autor) |

---

## 📋 Categorías disponibles

`Tecnología`, `Política`, `Deportes`, `Entretenimiento`, `Ciencia`, `Salud`, `Educación`, `Economía`, `Cultura`, `Otros`

---

## 🔒 Seguridad implementada

- **JWT** para autenticación stateless
- **Bcrypt** (salt 12) para hash de contraseñas
- **Helmet** — headers de seguridad HTTP
- **Rate Limiting** — 100 req/15min general, 10 req/15min en login/registro
- **CORS** habilitado
- **Validaciones** con express-validator en todos los inputs
- **Propietario verificado** — edición/eliminación solo por el autor
- **Contraseña no retornada** en queries (select: false)

---

##  Ejemplo de uso con curl

```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"juan01","email":"juan@example.com","password":"mipass123","nombre":"Juan García"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"juan01","password":"mipass123"}'

# Crear publicación (con token)
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"titulo":"Mi opinión","categoria":"Tecnología","contenido":"Creo que la IA es el futuro..."}'
```
