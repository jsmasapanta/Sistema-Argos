const prisma = require('../config/prisma');

// Horas de vuelo acumuladas por piloto
async function horasPorPiloto(req, res) {
  try {
    const pilotos = await prisma.piloto.findMany({
      include: { vuelos: { select: { fechaInicio: true, fechaFin: true } } },
      orderBy: { nombre: 'asc' },
    });

    const reporte = pilotos.map((p) => {
      const horas = p.vuelos.reduce((acc, v) => {
        return acc + (v.fechaFin - v.fechaInicio) / (1000 * 60 * 60);
      }, 0);
      return {
        pilotoId: p.id,
        nombre: p.nombre,
        totalVuelos: p.vuelos.length,
        horasTotales: Math.round(horas * 10) / 10, // redondeo a 1 decimal
      };
    });

    res.json(reporte);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte de horas por piloto' });
  }
}

// Horas de vuelo acumuladas por UAV (usa el campo ya calculado en la tabla uavs)
async function horasPorUAV(req, res) {
  try {
    const uavs = await prisma.uAV.findMany({
      select: {
        id: true,
        codigo: true,
        modelo: true,
        estado: true,
        horasTotales: true,
        _count: { select: { vuelos: true, mantenimientos: true } },
      },
      orderBy: { codigo: 'asc' },
    });

    const reporte = uavs.map((u) => ({
      uavId: u.id,
      codigo: u.codigo,
      modelo: u.modelo,
      estado: u.estado,
      horasTotales: u.horasTotales,
      totalVuelos: u._count.vuelos,
      totalMantenimientos: u._count.mantenimientos,
    }));

    res.json(reporte);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte de horas por UAV' });
  }
}

// Historial de mantenimiento de todos los UAVs
async function historialMantenimiento(req, res) {
  try {
    const mantenimientos = await prisma.mantenimiento.findMany({
      include: { uav: { select: { codigo: true, modelo: true } } },
      orderBy: { fecha: 'desc' },
    });
    res.json(mantenimientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener historial de mantenimiento' });
  }
}

// Resumen general para un dashboard inicial
async function resumenGeneral(req, res) {
  try {
    const [totalUAVs, uavsOperativos, totalPilotos, totalVuelos] = await Promise.all([
      prisma.uAV.count(),
      prisma.uAV.count({ where: { estado: 'operativo' } }),
      prisma.piloto.count(),
      prisma.vuelo.count(),
    ]);

    res.json({ totalUAVs, uavsOperativos, totalPilotos, totalVuelos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar resumen general' });
  }
}

module.exports = { horasPorPiloto, horasPorUAV, historialMantenimiento, resumenGeneral };