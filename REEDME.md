# Malbec Connected Back

API REST para Malbec Connected, una app de publicaciones de vinerias y bodegas.

## Comandos

```bash
npm install
npm run dev
npm start
npm run seed:publications
```

El archivo `.env` debe incluir:

```env
PORT=3000
MONGODB_URI=
JWT_SECRET=
FRONTEND_URL=http://localhost:5173
```

## Auth

Tambien se mantienen las rutas antiguas `/auth`.

### Registrar usuario

`POST http://localhost:3000/api/auth/register`

```json
{
  "username": "admin",
  "password": "123456"
}
```

### Login

`POST http://localhost:3000/api/auth/login`

```json
{
  "username": "admin",
  "password": "123456"
}
```

La respuesta incluye un `token`. Para rutas privadas usar:

```txt
Authorization: Bearer TOKEN
```

### Usuario actual

`GET http://localhost:3000/api/auth/me`

La respuesta de `register`, `login` y `me` incluye:

```json
{
  "user": {
    "id": "USER_ID",
    "username": "admin",
    "profile": {
      "fantasyName": "",
      "address": "",
      "phone": "",
      "contactEmail": ""
    }
  }
}
```

## Perfil del local

Tambien se mantienen los aliases sin `/api`: `/profile`.

### Ver perfil

`GET http://localhost:3000/api/profile`

Requiere Bearer token.

### Actualizar perfil

`PUT http://localhost:3000/api/profile`

Requiere Bearer token.

```json
{
  "fantasyName": "Vinoteca Los Andes",
  "address": "Av. Siempre Viva 123",
  "phone": "+54 261 555-1234",
  "contactEmail": "contacto@losandes.com"
}
```

`fantasyName` es obligatorio. `contactEmail` puede estar vacio, pero si se carga debe tener formato de email.

## Publicaciones

Tambien se mantienen los aliases sin `/api`: `/publications`.

### Listado publico

`GET http://localhost:3000/api/publications`

Devuelve publicaciones activas ordenadas por fecha descendente.

### Detalle publico

`GET http://localhost:3000/api/publications/:id`

Devuelve la publicacion, comentarios y datos de puntuacion.

### Crear publicacion

`POST http://localhost:3000/api/publications`

Requiere Bearer token.

```json
{
  "title": "Nuevo Malbec Reserva 2023",
  "productName": "Altura Malbec Reserva",
  "description": "Malbec intenso con notas de ciruela y roble suave.",
  "imageUrl": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
  "type": "Tinto",
  "category": "Recomendación",
  "price": 12500,
  "year": 2023
}
```

Los campos `businessName`, `wineryName`, `contactEmail`, `address` y `phone` se toman siempre del perfil del usuario logueado.

### Editar publicacion

`PATCH http://localhost:3000/api/publications/:id`

Requiere Bearer token.

```json
{
  "price": 13200,
  "description": "Descripcion actualizada para el catalogo publico."
}
```

Tambien existe `PUT http://localhost:3000/api/publications/:id` con el mismo comportamiento.

### Eliminar publicacion

`DELETE http://localhost:3000/api/publications/:id`

Requiere Bearer token. La eliminacion es logica: cambia `isActive` a `false` y deja de aparecer en el listado publico.

## Comentarios y puntuacion

### Comentar

`POST http://localhost:3000/api/publications/:id/comments`

```json
{
  "authorName": "Agustin",
  "content": "Muy buen vino",
  "rating": 5
}
```

`rating` es opcional y debe estar entre 1 y 5.

### Puntuar sin comentar

`POST http://localhost:3000/api/publications/:id/rate`

```json
{
  "rating": 4
}
```

## Validaciones principales

- `title`, `productName`, `description`, `type` y `category` son obligatorios al crear publicaciones.
- `type` acepta: `Tinto`, `Blanco`, `Rosado`, `Espumante`, `Otro`.
- `category` acepta: `Recomendación`, `Consulta`, `Reseña`, `Evento`, `Compra/Venta`, `Otro`.
- Para publicar, el usuario debe tener `profile.fantasyName` cargado.
- `rating` debe ser un entero entre 1 y 5.
- `price` no puede ser negativo.
- `year` debe estar entre 1900 y el anio actual + 1.
- IDs con formato invalido responden 400.
- IDs validos inexistentes responden 404.
