# Sistema ARGOS

**Sistema de Gestión y Seguimiento de Drones**
Grupo de Monitoreo y Reconocimiento Electrónico del Ejército (GMREC) — Ejército Ecuatoriano

> *"Ex Umbris"*

Registro digital del libro de UAV y pilotos: gestión de drones, personal habilitado, bitácora de vuelos, mantenimiento, reportes y usuarios con control de acceso por roles.

---

## Descripción del proyecto

ARGOS digitaliza el registro y control de vehículos aéreos no tripulados (UAV) y de los pilotos que los operan, en el marco de las prácticas preprofesionales de la carrera de Ingeniería de Software, para la unidad GMREC.

**Problema que resuelve:** el registro de operaciones se llevaba de forma manual o en hojas de cálculo, dificultando la trazabilidad de horas de vuelo, el mantenimiento oportuno de los equipos y la generación de reportes.

## Módulos del sistema

| Módulo | Descripción |
|---|---|
| **Autenticación y Roles** | Login con JWT, 3 roles (admin, operador, piloto), activar/desactivar cuentas |
| **UAVs** | Registro, estado, especificaciones técnicas, foto, mantenimiento |
| **Pilotos** | Personal habilitado, licencias, rango militar, especialidad, UAV asignado |
| **Bitácora de Vuelos** | Registro de vuelos con ubicación GPS (mapa), foto, validación de traslapes |
| **Mantenimiento** | Registro de intervenciones, cambio automático de estado del UAV |
| **Reportes** | Dashboard con estadísticas, análisis dinámico, gráficos, exportación PDF/Excel |
| **Usuarios** | Gestión de cuentas, roles, último acceso (solo administrador) |

## Roles del sistema

| Rol | Permisos |
|---|---|
| **Administrador** | Acceso total: usuarios, UAVs, pilotos, bitácora, reportes |
| **Operador** | Gestiona UAVs, pilotos (edición) y bitácora de vuelos. Sin acceso a Usuarios |
| **Piloto** | Registra y consulta únicamente sus propios vuelos |

## Arquitectura técnica

```
Frontend (React)  →  Backend API (Node.js/Express)  →  Base de datos (PostgreSQL)
```

- **Backend:** Node.js + Express + Prisma ORM + PostgreSQL + JWT
- **Frontend:** React + Vite + Tailwind CSS + TanStack Query + Leaflet (mapas)

Ver el detalle técnico completo en:
- [`argos-backend/README.md`](./argos-backend/README.md)
- [`argos-frontend/README.md`](./argos-frontend/README.md)

## Estructura del repositorio

```
Sistema Argos/
├── argos-backend/     # API REST (Node.js + Express + Prisma)
├── argos-frontend/    # Interfaz web (React + Vite)
└── README.md          # Este archivo
```

## Inicio rápido

1. Clona el repositorio.
2. Sigue las instrucciones de instalación en `argos-backend/README.md` (base de datos, variables de entorno, migraciones).
3. Sigue las instrucciones de instalación en `argos-frontend/README.md`.
4. Levanta ambos servidores (`node src/server.js` en el backend, `npm run dev` en el frontend).
5. Abre `http://localhost:5173` en el navegador.

## Contexto académico

- **Carrera:** Ingeniería de Software
- **Periodo de prácticas:** 03 de agosto — 30 de septiembre de 2026
- **Unidad receptora:** GMREC — Ejército Ecuatoriano
