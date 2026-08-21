/*
  Warnings:

  - A unique constraint covering the columns `[serial_id]` on the table `uavs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "uavs" ADD COLUMN     "alcance_max" INTEGER,
ADD COLUMN     "autonomia" INTEGER,
ADD COLUMN     "camara" TEXT,
ADD COLUMN     "peso_maximo" DOUBLE PRECISION,
ADD COLUMN     "serial_id" TEXT,
ADD COLUMN     "velocidad_max" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "uavs_serial_id_key" ON "uavs"("serial_id");
