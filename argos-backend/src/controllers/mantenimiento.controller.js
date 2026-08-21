const prisma = require('../config/prisma');

async function listarMantenimientos(req, res) {
  try {
    const mantenimientos = await prisma.mantenimiento.findMany({
      include: { uav: { select: { codigo: true, modelo: true } } },
      orderBy: { fecha: 'desc' },
    });
    res.json(mantenimientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar mantenimientos' });
  }
}

async function actualizarMantenimiento(req, res) {
  try {
    const { estado, tipo, descripcion } = req.body || {};
    const mantenimiento = await prisma.mantenimiento.update({
      where: { id: req.params.id },
      data: {
        estado: estado || undefined,
        tipo: tipo || undefined,
        descripcion: descripcion !== undefined ? descripcion : undefined,
      },
    });
    res.json(mantenimiento);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar mantenimiento' });
  }
}

async function crearMantenimiento(req, res) {
  try {
    const { uavId, fecha, tipo, descripcion, estado } = req.body || {};

    if (!uavId || !fecha || !tipo) {
      return res.status(400).json({ error: 'uavId, fecha y tipo son requeridos' });
    }

    const uav = await prisma.uAV.findUnique({ where: { id: uavId } });
    if (!uav) {
      return res.status(404).json({ error: 'UAV no encontrado' });
    }

    const [mantenimiento] = await prisma.$transaction([
      prisma.mantenimiento.create({
        data: { uavId, fecha: new Date(fecha), tipo, descripcion, estado: estado || 'pendiente' },
      }),
      prisma.uAV.update({
        where: { id: uavId },
        data: { estado: 'en_mantenimiento' },
      }),
    ]);

    res.status(201).json(mantenimiento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear mantenimiento' });
  }
}

async function finalizarMantenimiento(req, res) {
  try {
    const mantenimiento = await prisma.mantenimiento.findUnique({ where: { id: req.params.id } });
    if (!mantenimiento) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }

    await prisma.uAV.update({
      where: { id: mantenimiento.uavId },
      data: { estado: 'operativo' },
    });

    res.json({ mensaje: 'UAV marcado como operativo nuevamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al finalizar mantenimiento' });
  }
}

module.exports = { listarMantenimientos, crearMantenimiento, finalizarMantenimiento, actualizarMantenimiento };