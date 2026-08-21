-- CreateEnum
CREATE TYPE "EstadoMantenimiento" AS ENUM ('pendiente', 'en_proceso', 'completado');

-- AlterTable
ALTER TABLE "mantenimientos" ADD COLUMN     "estado" "EstadoMantenimiento" NOT NULL DEFAULT 'pendiente';
