-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('admin', 'operador', 'piloto');

-- CreateEnum
CREATE TYPE "EstadoUAV" AS ENUM ('operativo', 'en_mantenimiento', 'de_baja');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pilotos" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "licencia" TEXT NOT NULL,
    "vencimiento_licencia" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pilotos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uavs" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "estado" "EstadoUAV" NOT NULL DEFAULT 'operativo',
    "horas_totales" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "uavs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vuelos" (
    "id" TEXT NOT NULL,
    "piloto_id" TEXT NOT NULL,
    "uav_id" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "novedades" TEXT,

    CONSTRAINT "vuelos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mantenimientos" (
    "id" TEXT NOT NULL,
    "uav_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "mantenimientos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pilotos_usuario_id_key" ON "pilotos"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "uavs_codigo_key" ON "uavs"("codigo");

-- AddForeignKey
ALTER TABLE "pilotos" ADD CONSTRAINT "pilotos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vuelos" ADD CONSTRAINT "vuelos_piloto_id_fkey" FOREIGN KEY ("piloto_id") REFERENCES "pilotos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vuelos" ADD CONSTRAINT "vuelos_uav_id_fkey" FOREIGN KEY ("uav_id") REFERENCES "uavs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantenimientos" ADD CONSTRAINT "mantenimientos_uav_id_fkey" FOREIGN KEY ("uav_id") REFERENCES "uavs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
