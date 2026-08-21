-- CreateEnum
CREATE TYPE "EstadoVuelo" AS ENUM ('completado', 'finalizado', 'con_novedad');

-- AlterTable
ALTER TABLE "vuelos" ADD COLUMN     "area_sector" TEXT,
ADD COLUMN     "bateria_utilizada" INTEGER,
ADD COLUMN     "condiciones_climaticas" TEXT,
ADD COLUMN     "estado" "EstadoVuelo" NOT NULL DEFAULT 'completado',
ADD COLUMN     "mision" TEXT,
ADD COLUMN     "objetivo" TEXT,
ADD COLUMN     "ruta_coordenadas" TEXT;
