-- AlterTable
ALTER TABLE "pilotos" ADD COLUMN     "especialidad" TEXT,
ADD COLUMN     "rango" TEXT,
ADD COLUMN     "uav_asignado_id" TEXT;

-- AddForeignKey
ALTER TABLE "pilotos" ADD CONSTRAINT "pilotos_uav_asignado_id_fkey" FOREIGN KEY ("uav_asignado_id") REFERENCES "uavs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
