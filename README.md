# Sistema ARGOS

**Sistema de Gestión y Seguimiento de Drones**
Grupo de Monitoreo y Reconocimiento Electrónico del Ejército (GMREC) — Ejército Ecuatoriano

> *"Ex Umbris"*

---

## Tabla de contenidos

1. [Contexto y objetivo](#contexto-y-objetivo)
2. [Arquitectura general](#arquitectura-general)
3. [Tecnologías](#tecnologías)
4. [Roles del sistema](#roles-del-sistema)
5. [Módulos](#módulos)
6. [Modelo de datos](#modelo-de-datos)
7. [Instalación paso a paso](#instalación-paso-a-paso)
8. [Variables de entorno](#variables-de-entorno)
9. [Estructura de carpetas](#estructura-de-carpetas)
10. [Endpoints de la API](#endpoints-de-la-api)
11. [Reglas de negocio](#reglas-de-negocio)
12. [Sistema de diseño (frontend)](#sistema-de-diseño-frontend)
13. [Solución de problemas comunes](#solución-de-problemas-comunes)
14. [Pendientes / próximos pasos](#pendientes--próximos-pasos)

---

## Contexto y objetivo

Actualmente el registro de operaciones de los vehículos aéreos no tripulados (UAV) y de los pilotos que los operan se lleva de forma manual o en hojas de cálculo, lo que dificulta la trazabilidad de horas de vuelo, el mantenimiento oportuno de los equipos y la generación de reportes.

**ARGOS** digitaliza y centraliza este control mediante un sistema de registro (bitácora) de UAVs y pilotos, desarrollado en el marco de las prácticas preprofesionales de la carrera de Ingeniería de Software, para la unidad GMREC.

**Objetivo general:** desarrollar un sistema informático de registro y control (libro/bitácora) de los UAV y de los pilotos que los operan, que permita centralizar la información operativa y facilitar la generación de reportes.

---

## Arquitectura general

```
┌─────────────┐        HTTP/JSON        ┌──────────────┐        Prisma ORM        ┌──────────────┐
│  FRONTEND   │  ───────────────────▶  │   BACKEND    │  ───────────────────▶   │  BASE DE     │
│  React      │  ◀───────────────────  │  Node/Express │  ◀───────────────────   │  DATOS       │
│  (puerto    │        JWT auth          │  (puerto 4000)│                          │  PostgreSQL  │
│   5173)     │                          └──────────────┘                          └──────────────┘
```

- El **frontend** nunca accede directo a la base de datos; siempre pasa por la API.
- La autenticación usa **JWT** (JSON Web Token), válido por 8 horas, enviado en el header `Authorization: Bearer <token>`.
- Las imágenes (fotos de UAVs, pilotos y vuelos) se guardan en el sistema de archivos del servidor (`uploads/`) y se sirven como archivos estáticos.
- El mapa de ubicación de vuelos usa **OpenStreetMap** vía Leaflet (sin necesidad de clave de API).

---

## Tecnologías

### Backend (`argos-backend`)

| Tecnología | Uso |
|---|---|
| Node.js + Express | Servidor HTTP y enrutamiento |
| Prisma ORM (v7) | Acceso a base de datos y migraciones |
| PostgreSQL | Base de datos relacional |
| jsonwebtoken | Generación y verificación de JWT |
| bcrypt | Hash de contraseñas |
| Multer | Recepción de archivos (fotos) por multipart/form-data |
| PDFKit | Generación de reportes en PDF |
| ExcelJS | Generación de reportes en Excel |
| @prisma/adapter-pg + pg | Driver de conexión a PostgreSQL (requerido por Prisma 7) |

### Frontend (`argos-frontend`)

| Tecnología | Uso |
|---|---|
| React 18 + Vite | Interfaz de usuario y entorno de desarrollo |
| React Router | Enrutamiento entre pantallas |
| TanStack Query | Peticiones a la API con cache automático |
| Axios | Cliente HTTP (con interceptor que añade el JWT a cada petición) |
| Tailwind CSS v4 | Sistema de estilos (vía `@theme` en `index.css`) |
| lucide-react | Iconografía |
| Leaflet + React-Leaflet | Mapa interactivo para ubicación GPS de vuelos |
| Recharts | Gráficos de barras en el dashboard de Reportes |

---

## Roles del sistema

| Rol | Descripción | Acceso |
|---|---|---|
| **Administrador** | Control total del sistema | Todos los módulos, incluyendo Usuarios |
| **Operador** | Gestión operativa diaria | UAVs, Pilotos (sin crear), Bitácora, Reportes. Sin acceso a Usuarios |
| **Piloto** | Personal de vuelo | Solo su propio perfil y sus propios vuelos ("Mis Vuelos") |

**Regla de seguridad especial:** el sistema nunca permite que quede sin ningún administrador activo — bloquea intentos de eliminar, desactivar o cambiar de rol al último admin.

---

## Módulos

### 1. Autenticación y Usuarios
- Login con JWT (expira en 8 horas).
- Registro de usuarios (solo admin puede crear cuentas).
- Activar / desactivar cuentas (las cuentas inactivas no pueden iniciar sesión).
- Cambiar el rol de un usuario.
- Eliminar usuarios (bloqueado si tiene UAVs/pilotos creados o si es el único admin).
- Registro de **último acceso** (fecha y hora del login más reciente).
- Panel con estadísticas (total, activos, inactivos, administradores), buscador, filtros por rol/estado, paginación.

### 2. UAVs
- CRUD completo: código único, modelo, estado (`operativo`, `en_mantenimiento`, `de_baja`).
- Especificaciones técnicas opcionales: peso máximo, autonomía, alcance máximo, velocidad máxima, cámara, serial/ID.
- Foto del UAV (subida de imagen).
- Horas totales de vuelo (se calculan automáticamente al registrar vuelos).
- Alerta automática de "mantenimiento pronto" a partir de 50 horas de vuelo acumuladas.
- Trazabilidad: quién creó el registro y cuándo.
- Buscador, filtro por estado y por modelo, paginación, vista de tarjetas y vista de tabla.

### 3. Pilotos
- CRUD completo: nombre, licencia, vencimiento de licencia.
- Vinculado obligatoriamente a un usuario con rol `piloto`.
- Rango militar (Subteniente, Teniente, Capitán, Mayor, Teniente Coronel, Coronel).
- Especialidad (Comunicaciones, Inteligencia, Reconocimiento, Vigilancia, Instructor, Pruebas).
- UAV asignado (opcional).
- Foto del piloto (el propio piloto puede actualizar solo la suya).
- Alerta de licencia vencida o por vencer (30 días).
- Trazabilidad: quién creó el registro y cuándo.

### 4. Bitácora de Vuelos
- Registro de vuelo: piloto, UAV, fecha/hora de inicio y fin, misión, objetivo.
- **Ubicación:** campo de texto libre + coordenadas GPS marcadas en un mapa interactivo (Leaflet/OpenStreetMap).
- Condiciones climáticas, porcentaje de batería utilizada.
- Foto del vuelo.
- Estado del vuelo: `completado`, `finalizado`, `con_novedad`.
- Cálculo automático de horas de vuelo (se suman al UAV correspondiente).
- **Validación de traslape:** un UAV no puede tener dos vuelos con horarios que se crucen.
- Edición de novedades en línea (admin/operador en cualquier vuelo; piloto solo en los suyos).
- El piloto puede registrar sus propios vuelos (queda fijo como piloto, no puede asignar a otro).
- Panel de detalle lateral con toda la información del vuelo seleccionado.
- Estadísticas, filtros (UAV, piloto, estado, texto), paginación.

### 5. Mantenimiento
- Registro de intervenciones: UAV, fecha, tipo, descripción, estado (`pendiente`, `en_proceso`, `completado`).
- Al registrar un mantenimiento, el UAV pasa automáticamente a estado `en_mantenimiento`.
- Botón para "finalizar" mantenimiento y devolver el UAV a `operativo`.

### 6. Reportes
- Estadísticas generales (UAVs, pilotos, vuelos, horas totales).
- **Análisis dinámico:** filtros por fecha, UAV, piloto, estado y misión, con botón "Generar análisis" que recalcula en tiempo real.
- Tabla cruzada de horas por piloto × UAV, con vista alternable de tabla o gráfico de barras.
- Mantenimientos agrupados por tipo × estado, con vista de tabla o gráfico.
- Resumen general de operaciones e historial de mantenimiento.
- Exportación a **PDF** y **Excel** con el mismo contenido de resumen, horas por piloto, UAVs y mantenimientos.

---

## Modelo de datos

Entidades principales (ver `argos-backend/prisma/schema.prisma` para el detalle exacto):

**Usuario**
`id, email, passwordHash, rol (admin/operador/piloto), activo, ultimoAcceso, creadoEn`

**Piloto**
`id, usuarioId → Usuario, nombre, licencia, vencimientoLicencia, fotoUrl, rango, especialidad, uavAsignadoId → UAV, creadoPorId → Usuario, creadoEn`

**UAV**
`id, codigo (único), modelo, estado, horasTotales, fotoUrl, pesoMaximo, autonomia, alcanceMax, velocidadMax, camara, serialId (único), creadoPorId → Usuario, creadoEn`

**Vuelo**
`id, pilotoId → Piloto, uavId → UAV, fechaInicio, fechaFin, novedades, estado, mision, objetivo, areaSector, ubicacion, latitud, longitud, condicionesClimaticas, bateriaUtilizada, fotoUrl`

**Mantenimiento**
`id, uavId → UAV, fecha, tipo, descripcion, estado (pendiente/en_proceso/completado)`

**Relaciones clave:**
- Un Piloto pertenece a un Usuario (1:1).
- Un Piloto realiza muchos Vuelos; un UAV se usa en muchos Vuelos.
- Un UAV tiene muchos registros de Mantenimiento.
- Un Piloto puede tener un UAV asignado (opcional).

---

## Instalación paso a paso

### Requisitos previos
- Node.js 18 o superior
- PostgreSQL corriendo (local o en contenedor Docker)
- npm

### Backend

```bash
cd argos-backend
npm install
```

Crea `argos-backend/.env`:

```
PORT=4000
JWT_SECRET=una-clave-secreta-larga-y-aleatoria
DATABASE_URL=postgresql://usuario:password@localhost:5432/argos_db
```

Aplica el esquema a la base de datos:

```bash
npx prisma migrate dev
npx prisma generate
```

Levanta el servidor:

```bash
node src/server.js
```

Verifica en el navegador: `http://localhost:4000/api/v1/health`

### Frontend

```bash
cd argos-frontend
npm install
```

Crea `argos-frontend/.env`:

```
VITE_API_URL=http://localhost:4000/api/v1
```

Levanta el servidor de desarrollo:

```bash
npm run dev
```

Abre `http://localhost:5173` en el navegador.

### Crear el primer usuario administrador

Como el registro requiere estar autenticado como admin, el primer usuario se crea directo con una petición a `/auth/register` sin token la primera vez, o insertando manualmente en la base de datos con una contraseña encriptada con bcrypt. (En este proyecto, el primer admin se creó antes de proteger la ruta; si partes de cero, temporalmente comenta el middleware `checkRole('admin')` en esa ruta, crea el primer admin, y vuelve a activarlo).

---

## Variables de entorno

**Backend (`argos-backend/.env`)**

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (por defecto 4000) |
| `JWT_SECRET` | Clave secreta para firmar los tokens |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |

**Frontend (`argos-frontend/.env`)**

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API (incluye `/api/v1`) |

---

## Estructura de carpetas

```
Sistema Argos/
├── argos-backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Modelo de datos completo
│   │   └── migrations/            # Historial de migraciones
│   ├── src/
│   │   ├── config/                  # Conexión a Prisma
│   │   ├── controllers/               # Lógica de cada módulo
│   │   ├── routes/                      # Definición de endpoints
│   │   ├── middlewares/                   # authenticate, checkRole, upload
│   │   ├── generated/prisma/                # Cliente Prisma (autogenerado)
│   │   └── server.js                          # Punto de entrada
│   ├── uploads/                     # Fotos subidas (uavs/, pilotos/, vuelos/)
│   └── prisma.config.ts
│
├── argos-frontend/
│   ├── src/
│   │   ├── api/                # Funciones de conexión a la API por módulo
│   │   ├── components/           # Componentes reutilizables
│   │   ├── context/                 # AuthContext (sesión, rol)
│   │   ├── pages/                     # Una pantalla por módulo
│   │   └── assets/                      # Sello institucional, fondos, imágenes
│   └── index.html
│
└── README.md
```

---

## Endpoints de la API

Todas las rutas van prefijadas con `/api/v1`.

### Autenticación y Usuarios
| Método | Ruta | Rol requerido |
|---|---|---|
| POST | `/auth/login` | Público |
| POST | `/auth/register` | Admin |
| GET | `/auth/usuarios` | Admin |
| PUT | `/auth/usuarios/:id/estado` | Admin |
| PUT | `/auth/usuarios/:id/rol` | Admin |
| DELETE | `/auth/usuarios/:id` | Admin |

### UAVs
| Método | Ruta | Rol requerido |
|---|---|---|
| GET | `/uavs` | Autenticado |
| GET | `/uavs/:id` | Autenticado |
| POST | `/uavs` | Admin, Operador |
| PUT | `/uavs/:id` | Admin, Operador |
| POST | `/uavs/:id/foto` | Admin, Operador |
| PUT | `/uavs/:id/finalizar-mantenimiento` | Admin, Operador |
| DELETE | `/uavs/:id` | Admin |

### Pilotos
| Método | Ruta | Rol requerido |
|---|---|---|
| GET | `/pilotos` | Autenticado |
| GET | `/pilotos/mi-perfil` | Piloto |
| GET | `/pilotos/:id` | Autenticado |
| POST | `/pilotos` | Admin |
| PUT | `/pilotos/:id` | Admin, Operador |
| POST | `/pilotos/:id/foto` | Admin, Operador, Piloto (solo su propia foto) |
| DELETE | `/pilotos/:id` | Admin |

### Vuelos
| Método | Ruta | Rol requerido |
|---|---|---|
| GET | `/vuelos` | Admin, Operador |
| GET | `/vuelos/mios` | Piloto |
| GET | `/vuelos/:id` | Autenticado |
| POST | `/vuelos` | Autenticado (piloto solo a su propio nombre) |
| PUT | `/vuelos/:id` | Autenticado (piloto solo novedades de los suyos) |
| POST | `/vuelos/:id/foto` | Autenticado |

### Mantenimiento
| Método | Ruta | Rol requerido |
|---|---|---|
| GET | `/mantenimientos` | Autenticado |
| POST | `/mantenimientos` | Admin, Operador |
| PUT | `/mantenimientos/:id` | Admin, Operador |

### Reportes
| Método | Ruta | Rol requerido |
|---|---|---|
| GET | `/reportes/resumen` | Autenticado |
| GET | `/reportes/horas-por-piloto` | Autenticado |
| GET | `/reportes/horas-por-uav` | Autenticado |
| GET | `/reportes/mantenimientos` | Autenticado |
| GET | `/reportes/horas-piloto-uav` | Autenticado |
| GET | `/reportes/mantenimientos-tipo-estado` | Autenticado |
| GET | `/reportes/exportar/pdf` | Admin, Operador |
| GET | `/reportes/exportar/excel` | Admin, Operador |

---

## Reglas de negocio

1. Un UAV no puede tener dos vuelos con horarios que se traslapen.
2. Las horas de vuelo se calculan automáticamente y se suman al total del UAV.
3. Registrar un mantenimiento cambia el UAV a `en_mantenimiento`; finalizarlo lo regresa a `operativo`.
4. Un piloto solo puede registrar vuelos a su propio nombre, y solo editar las novedades de sus propios vuelos.
5. No se puede eliminar un UAV, piloto o usuario que tenga registros relacionados (vuelos, mantenimientos) — se debe desactivar en su lugar.
6. El sistema nunca permite quedarse sin administradores activos.
7. Las cuentas desactivadas no pueden iniciar sesión.
8. Un UAV con 50+ horas de vuelo acumuladas genera una alerta de mantenimiento próximo.
9. Una licencia de piloto genera alerta cuando faltan 30 días o menos para vencer, o si ya venció.

---

## Sistema de diseño (frontend)

**Paleta de colores** (definida en `src/index.css` mediante `@theme` de Tailwind v4):

| Color | Hex | Uso |
|---|---|---|
| Navy oscuro | `#0D1B33` | Fondos oscuros, barra lateral |
| Navy | `#142850` | Encabezados de tabla, acentos |
| Navy claro | `#24406B` | Bordes sobre fondo oscuro |
| Hielo | `#E8ECF4` | Fondos claros |
| Rojo institucional | `#C1121F` | Acentos, alertas, franja superior |
| Dorado | `#C9A227` | Detalles del login, sello institucional |
| Verde éxito | `#02C39A` | Estados positivos |
| Ámbar advertencia | `#D97706` | Alertas de atención |

**Tipografía:** Space Grotesk (títulos, `font-display`) + Inter (texto, `font-sans`).

**Componentes base reutilizables:** `Layout.jsx` (barra lateral con navegación filtrada por rol), `ModuleCard.jsx`, `ConfirmarAccion.jsx` (modal de confirmación), `ToastExito.jsx` (notificación de éxito), `SelectorMapa.jsx` (mapa interactivo Leaflet).

---

## Solución de problemas comunes

**"Cannot find module" al iniciar el backend después de un cambio:**
Node no relee los archivos automáticamente. Detén el servidor (`Ctrl+C`) y vuelve a correr `node src/server.js`.

**Error de Prisma "Unknown field" después de editar el esquema:**
Falta regenerar el cliente. Corre `npx prisma generate` y reinicia el servidor.

**El navegador muestra una versión vieja después de un cambio en el frontend:**
Fuerza la recarga con `Ctrl+Shift+R`, o reinicia `npm run dev` si el cambio involucra una librería nueva o `import.meta.glob`.

**Errores con comillas en PowerShell al usar `curl`:**
Usa `Invoke-RestMethod` con el body construido como objeto y convertido con `ConvertTo-Json`, en vez de `curl.exe` con comillas escapadas.

---

## Pendientes / próximos pasos

- Pruebas automatizadas (Jest + Supertest) para los flujos críticos (login, CRUD de UAVs, validación de traslape de vuelos).
- Manual de usuario y manual técnico para el informe final de prácticas.
- Pruebas de aceptación de usuario (UAT) con personal real de GMREC.
- Informe final de prácticas preprofesionales.

---

## Contexto académico

- **Carrera:** Ingeniería de Software
- **Periodo de prácticas:** 03 de agosto — 30 de septiembre de 2026
- **Unidad receptora:** GMREC — Ejército Ecuatoriano
