const prisma = require('../config/prisma');

async function listarUAVs(req, res) {
  try {
    const uavs = await prisma.uAV.findMany({ orderBy: { codigo: 'asc' } });
    res.json(uavs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar UAVs' });
  }
}

async function obtenerUAV(req, res) {
  try {
    const uav = await prisma.uAV.findUnique({ where: { id: req.params.id } });
    if (!uav) return res.status(404).json({ error: 'UAV no encontrado' });
    res.json(uav);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener UAV' });
  }
}

async function crearUAV(req, res) {
  try {
    const { codigo, modelo, estado } = req.body;

    if (!codigo || !modelo) {
      return res.status(400).json({ error: 'codigo y modelo son requeridos' });
    }

    const uav = await prisma.uAV.create({
      data: { codigo, modelo, estado },
    });

    res.status(201).json(uav);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un UAV con ese código' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al crear UAV' });
  }
}

async function actualizarUAV(req, res) {
  try {
    const { modelo, estado, horasTotales } = req.body;

    const uav = await prisma.uAV.update({
      where: { id: req.params.id },
      data: { modelo, estado, horasTotales },
    });

    res.json(uav);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'UAV no encontrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar UAV' });
  }
}

async function eliminarUAV(req, res) {
  try {
    await prisma.uAV.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'UAV no encontrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar UAV' });
  }
}

module.exports = { listarUAVs, obtenerUAV, crearUAV, actualizarUAV, eliminarUAV };