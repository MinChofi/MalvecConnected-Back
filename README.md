# Malbec Connected Backend

Malbec Connected Backend es una API REST desarrollada con **Node.js**, **Express** y **MongoDB** para gestionar la información de Malbec Connected, una plataforma que conecta bodegas y vinotecas mediante publicaciones de vinos, comentarios y puntuaciones.

La API permite registrar usuarios, iniciar sesión, administrar el perfil comercial de cada cuenta y realizar el CRUD de publicaciones que se muestran en el frontend público.

---

## Características principales

- **Autenticación de usuarios:** registro, inicio de sesión y consulta del usuario autenticado.
- **Autenticación con JWT:** generación y validación de tokens con una duración de 24 horas.
- **Protección de contraseñas:** almacenamiento seguro mediante hash con `bcryptjs`.
- **Perfil comercial:** gestión del nombre de fantasía, dirección, teléfono y correo de contacto.
- **Gestión de publicaciones:** creación, consulta, modificación y baja lógica.
- **Control de propiedad:** solo el autor de una publicación puede editarla o eliminarla.
- **Foro público:** listado y detalle de publicaciones disponibles sin autenticación.
- **Comentarios:** usuarios autenticados pueden comentar y puntuar publicaciones.
- **Puntuaciones:** cálculo y actualización del promedio y la cantidad de votos.
- **Validaciones con Joi:** control de campos, formatos, tamaños y valores permitidos.
- **Manejo de imágenes:** recepción de imágenes JPG o PNG codificadas como Data URL en Base64.
- **MongoDB Atlas:** persistencia de usuarios, perfiles, publicaciones y comentarios.
- **CORS configurable:** acceso restringido al origen indicado en las variables de entorno.
- **Registro de solicitudes:** uso de Morgan para visualizar peticiones HTTP durante el desarrollo.
- **Carga de datos de prueba:** script opcional para crear publicaciones demostrativas.
- **Despliegue en Render:** ejecución de la API como servicio web independiente del frontend.

---

## Estructura del proyecto

```text
src/
├── config/
│   └── db.js                        # Conexión a MongoDB
├── controllers/
│   ├── authController.js            # Registro, login y usuario actual
│   ├── profileController.js         # Consulta y edición del perfil
│   └── publicationController.js     # CRUD, comentarios y puntuaciones
├── middlewares/
│   └── authMiddleware.js            # Validación del token JWT
├── models/
│   ├── User.js                      # Usuarios y perfil comercial
│   ├── Publication.js               # Publicaciones, contacto y puntuación
│   └── Comment.js                   # Comentarios asociados a publicaciones
├── routes/
│   ├── authRoutes.js                # Rutas de autenticación
│   ├── profileRoutes.js             # Rutas del perfil
│   └── publicationRoutes.js         # Rutas de publicaciones
├── seed/
│   └── publicationsSeed.js          # Datos demostrativos opcionales
├── utils/
│   └── userSerializer.js            # DTO seguro de usuarios
├── app.js                            # Configuración de Express y rutas
└── server.js                         # Inicio del servidor
```

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/MinChofi/MalbecConnected-Back.git
cd MalbecConnected-Back
```

### 2. Instalar las dependencias

```bash
npm install
```

### 3. Configurar las variables de entorno

Crea un archivo `.env` en la raíz del proyecto. Puedes utilizar `.env.example` como referencia:

```env
PORT=3000
MONGODB_URI=mongodb+srv://USUARIO:CONTRASENA@CLUSTER/malbecconnected?retryWrites=true&w=majority
JWT_SECRET=key_secreta
FRONTEND_URL=http://localhost:5173
NODE_VERSION=20.20.2
```

| Variable       | Descripción                                             |
| -------------- | ------------------------------------------------------- |
| `PORT`         | Puerto en el que se ejecuta la API.                     |
| `MONGODB_URI`  | Cadena de conexión a MongoDB Atlas.                     |
| `JWT_SECRET`   | Clave utilizada para firmar y verificar los tokens JWT. |
| `FRONTEND_URL` | Origen autorizado por la configuración de CORS.         |
| `NODE_VERSION` | Versión de Node.js configurada para el despliegue.      |

No deben utilizarse valores reales de producción dentro de `.env.example` ni subirse credenciales al repositorio.

### 4. Iniciar el servidor en desarrollo

```bash
npm run dev
```

Nodemon reiniciará el servidor automáticamente cuando detecte cambios.

### 5. Iniciar el servidor en modo normal

```bash
npm start
```

La API quedará disponible localmente en:

```text
http://localhost:3000
```

Para comprobar su funcionamiento:

```http
GET /
```

Respuesta esperada:

```json
{
  "message": "API Malbec Connected funcionando"
}
```

---

## Scripts disponibles

| Comando                     | Descripción                                   |
| --------------------------- | --------------------------------------------- |
| `npm run dev`               | Ejecuta el servidor con Nodemon.              |
| `npm start`                 | Ejecuta el servidor con Node.js.              |
| `npm run seed:publications` | Crea o actualiza publicaciones demostrativas. |

El comando de seed debe utilizarse únicamente en entornos de desarrollo o prueba.

---

## Endpoints principales

La ruta recomendada para consumir la API utiliza el prefijo `/api`:

```text
http://localhost:3000/api
```

Por compatibilidad, también se mantienen aliases sin ese prefijo:

- `/auth`
- `/profile`
- `/publications`

### Autenticación

| Método | Endpoint             | Acceso  | Descripción                                 |
| ------ | -------------------- | ------- | ------------------------------------------- |
| `POST` | `/api/auth/register` | Público | Registra un usuario y devuelve un token.    |
| `POST` | `/api/auth/login`    | Público | Autentica al usuario y devuelve un token.   |
| `GET`  | `/api/auth/me`       | Privado | Devuelve los datos del usuario autenticado. |

#### Registrar un usuario

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "username": "vinoteca_demo",
  "password": "123456"
}
```

#### Iniciar sesión

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "username": "vinoteca_demo",
  "password": "123456"
}
```

Las respuestas de registro e inicio de sesión incluyen el token y un DTO seguro del usuario:

```json
{
  "message": "Login correcto",
  "token": "TOKEN_JWT",
  "user": {
    "id": "ID_DEL_USUARIO",
    "username": "vinoteca_demo",
    "profile": {
      "fantasyName": "",
      "address": "",
      "phone": "",
      "contactEmail": ""
    }
  }
}
```

### Perfil comercial

| Método | Endpoint       | Acceso  | Descripción                                |
| ------ | -------------- | ------- | ------------------------------------------ |
| `GET`  | `/api/profile` | Privado | Obtiene el perfil comercial del usuario.   |
| `PUT`  | `/api/profile` | Privado | Actualiza el perfil comercial del usuario. |

#### Actualizar el perfil

```http
PUT /api/profile
Authorization: Bearer TOKEN_JWT
Content-Type: application/json
```

```json
{
  "fantasyName": "Vinoteca Los Andes",
  "address": "Av. Siempre Viva 123",
  "phone": "+54 261 555-1234",
  "contactEmail": "contacto@losandes.com"
}
```

El campo `fantasyName` es obligatorio. El correo de contacto puede estar vacío, pero si se completa debe tener un formato válido.

### Publicaciones

| Método  | Endpoint                | Acceso                | Descripción                                                       |
| ------- | ----------------------- | --------------------- | ----------------------------------------------------------------- |
| `GET`   | `/api/publications`     | Público               | Lista las publicaciones activas.                                  |
| `GET`   | `/api/publications/:id` | Público               | Obtiene una publicación, sus comentarios y puntuación.            |
| `POST`  | `/api/publications`     | Privado               | Crea una publicación.                                             |
| `PATCH` | `/api/publications/:id` | Privado y propietario | Modifica parcialmente una publicación.                            |
| `PUT`   | `/api/publications/:id` | Privado y propietario | Modifica una publicación con el mismo comportamiento que `PATCH`. |
| `DELETE`| `/api/publications/:id` | Privado y propietario | Realiza la baja lógica de una publicación.                        |

#### Crear una publicación

```http
POST /api/publications
Authorization: Bearer TOKEN_JWT
Content-Type: application/json
```

```json
{
  "title": "Nuevo Malbec Reserva 2023",
  "productName": "Altura Malbec Reserva",
  "description": "Malbec intenso con notas de ciruela y roble suave.",
  "publicationDate": "2026-07-20T12:00:00.000Z",
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
  "type": "Tinto",
  "category": "Recomendación",
  "price": 12500
}
```

Los siguientes datos no pueden ser definidos manualmente desde el cliente, ya que la API los obtiene del usuario autenticado y su perfil:

- `user`
- `businessName`
- `wineryName`
- `contactEmail`
- `address`
- `phone`
- `ratingAverage`
- `ratingCount`
- `isActive`

Para crear o editar publicaciones, el usuario debe haber configurado previamente su nombre de fantasía.

#### Editar una publicación

```http
PATCH /api/publications/:id
Authorization: Bearer TOKEN_JWT
Content-Type: application/json
```

```json
{
  "price": 13200,
  "description": "Descripción actualizada para el catálogo público."
}
```

Debe enviarse al menos un campo editable.

#### Eliminar una publicación

```http
DELETE /api/publications/:id
Authorization: Bearer TOKEN_JWT
```

La eliminación es lógica. La publicación permanece almacenada en MongoDB, pero el campo `isActive` cambia a `false` y deja de aparecer en las consultas públicas.

### Comentarios y puntuaciones

| Método | Endpoint                         | Acceso  | Descripción                                  |
| ------ | -------------------------------- | ------- | -------------------------------------------- |
| `POST` | `/api/publications/:id/comments` | Privado | Crea un comentario y registra su puntuación. |
| `POST` | `/api/publications/:id/rate`     | Público | Registra una puntuación sin comentario.      |

#### Agregar un comentario

```http
POST /api/publications/:id/comments
Authorization: Bearer TOKEN_JWT
Content-Type: application/json
```

```json
{
  "content": "Muy buen vino, excelente relación entre precio y calidad.",
  "rating": 5
}
```

El nombre del autor no se recibe desde el frontend. La API utiliza el nombre de fantasía del perfil y, si no está disponible, el nombre de usuario de la cuenta autenticada.

#### Puntuar sin comentar

```http
POST /api/publications/:id/rate
Content-Type: application/json
```

```json
{
  "rating": 4
}
```

La API actualiza `ratingAverage` y `ratingCount` cada vez que se registra una nueva puntuación.

---

## Autenticación

Las rutas privadas requieren un token JWT en el encabezado `Authorization`:

```http
Authorization: Bearer TOKEN_JWT
```

El token se genera al registrar un usuario o iniciar sesión y expira después de un día.

El middleware de autenticación realiza los siguientes controles:

1. Verifica que el encabezado utilice el formato `Bearer`.
2. Valida la firma y vigencia del token.
3. Busca al usuario correspondiente en MongoDB.
4. Adjunta el usuario autenticado a la solicitud sin exponer su contraseña.

El backend no necesita un endpoint de logout. El cierre de sesión se realiza en el frontend eliminando el token almacenado.

---

## Validaciones principales

### Publicaciones

- `title`, `productName`, `description`, `type` y `category` son obligatorios.
- `title` y `productName` admiten hasta 120 caracteres.
- `description` admite hasta 1500 caracteres.
- `price` debe ser un número mayor o igual a cero.
- `publicationDate` debe utilizar un formato de fecha ISO válido.
- Las imágenes deben ser JPG o PNG codificadas como Data URL.
- Las imágenes no pueden superar los 2 MB.
- El usuario debe tener un nombre de fantasía configurado para publicar.

Tipos permitidos:

- `Tinto`
- `Blanco`
- `Rosado`
- `Espumante`
- `Otro`

Categorías permitidas:

- `Recomendación`
- `Consulta`
- `Reseña`
- `Evento`
- `Compra/Venta`
- `Otro`

### Comentarios y puntuaciones

- El contenido del comentario es obligatorio.
- Los comentarios admiten hasta 1000 caracteres.
- La puntuación es obligatoria al comentar.
- La puntuación debe ser un número entero entre 1 y 5.

### Identificadores

- Un ID con formato inválido devuelve un error `400`.
- Un ID válido que no corresponde a una publicación activa devuelve un error `404`.
- Un usuario que intenta modificar una publicación ajena recibe un error `403`.

---

## Tecnologías utilizadas

- **Node.js:** entorno de ejecución de JavaScript utilizado por el servidor.
- **Express 5:** framework para construir la API REST y definir sus rutas.
- **MongoDB:** base de datos NoSQL utilizada para persistir la información.
- **Mongoose:** modelado, validación y acceso a documentos de MongoDB.
- **JSON Web Token:** autenticación y protección de rutas privadas.
- **bcryptjs:** hash seguro de las contraseñas antes de almacenarlas.
- **Joi:** validación de perfiles, publicaciones, comentarios y puntuaciones.
- **CORS:** control del origen autorizado para consumir la API.
- **Dotenv:** carga de variables de entorno desde el archivo `.env`.
- **Morgan:** registro de las solicitudes HTTP en consola.
- **Nodemon:** reinicio automático del servidor durante el desarrollo.
- **Render:** alojamiento del servicio backend en la nube.

---

## Seguridad

- Las contraseñas se almacenan mediante hash y nunca se devuelven en las respuestas.
- Las rutas privadas validan el token JWT y la existencia del usuario.
- Solo el propietario puede modificar o eliminar una publicación.
- Los campos sensibles o calculados de una publicación son ignorados si llegan desde el cliente.
- Joi valida los datos antes de guardarlos en la base de datos.
- CORS restringe las solicitudes al frontend configurado.
- El cuerpo JSON está limitado a 2 MB.
- `.env` está excluido mediante `.gitignore` y no debe subirse al repositorio.
- `JWT_SECRET` debe utilizar una clave extensa, aleatoria y diferente en cada entorno.
- Se recomienda utilizar HTTPS en producción.

---

## Despliegue

El backend está preparado para ejecutarse en **Render** utilizando:

```bash
npm install
```

como comando de instalación y:

```bash
npm start
```

como comando de inicio.

La API desplegada está disponible en:

```text
https://malbecconnected-back.onrender.com
```

En producción deben configurarse las variables `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` y `NODE_VERSION` desde el panel de Render.

---

## Notas

- El listado público devuelve únicamente publicaciones activas, ordenadas por fecha de publicación y creación de forma descendente.
- Los comentarios se devuelven desde el más reciente al más antiguo.
- Los datos comerciales de cada publicación se sincronizan con el perfil del propietario cuando se crea o modifica.
- La API mantiene rutas con y sin el prefijo `/api` para conservar compatibilidad con versiones anteriores del frontend.
- El seed de publicaciones contiene datos demostrativos y no debe ejecutarse sin revisión en una base de datos de producción.

---

## Alumno

Desarrollado por **Francisco Hector Sofia**, alumno UAI para la materia **METODOLOGÍAS Y DESARROLLOS WEB**.