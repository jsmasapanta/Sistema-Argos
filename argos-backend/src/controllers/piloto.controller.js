const prisma = require('../config/prisma');

async function listarPilotos(req, res) {
  try {
    const pilotos = await prisma.piloto.findMany({
      include: {
        usuario: { select: { email: true } },
        creadoPor: { select: { email: true } },
        uavAsignado: { select: { codigo: true } },
      },
      orderBy: { nombre: 'asc' },
    });
    res.json(pilotos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar pilotos' });
  }
}

async function obtenerPiloto(req, res) {
  try {
    const piloto = await prisma.piloto.findUnique({
      where: { id: req.params.id },
      include: { usuario: { select: { email: true } }, vuelos: true },
    });
    if (!piloto) return res.status(404).json({ error: 'Piloto no encontrado' });
    res.json(piloto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener piloto' });
  }
}

async function crearPiloto(req, res) {
  try {
    const { usuarioId, nombre, licencia, vencimientoLicencia, rango, especialidad, uavAsignadoId } = req.body || {};

    if (!usuarioId || !nombre || !licencia || !vencimientoLicencia) {
      return res.status(400).json({
        error: 'usuarioId, nombre, licencia y vencimientoLicencia son requeridos',
      });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) {
      return res.status(404).json({ error: 'El usuario indicado no existe' });
    }
    if (usuario.rol !== 'piloto') {
      return res.status(400).json({ error: 'El usuario debe tener rol "piloto"' });
    }

    const piloto = await prisma.piloto.create({
      data: {
        usuarioId,
        nombre,
        licencia,
        vencimientoLicencia: new Date(vencimientoLicencia),
        creadoPorId: req.user.id,
        rango: rango || undefined,
        especialidad: especialidad || undefined,
        uavAsignadoId: uavAsignadoId || undefined,
      },
    });

    res.status(201).json(piloto);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Este usuario ya tiene un perfil de piloto' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al crear piloto' });
  }
}

async function actualizarPiloto(req, res) {
  try {
    const { nombre, licencia, vencimientoLicencia, rango, especialidad, uavAsignadoId } = req.body;

    const piloto = await prisma.piloto.update({
      where: { id: req.params.id },
      data: {
        nombre,
        licencia,
        vencimientoLicencia: vencimientoLicencia ? new Date(vencimientoLicencia) : undefined,
        rango: rango !== undefined ? (rango || null) : undefined,
        especialidad: especialidad !== undefined ? (especialidad || null) : undefined,
        uavAsignadoId: uavAsignadoId !== undefined ? (uavAsignadoId || null) : undefined,
      },
    });

    res.json(piloto);

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Piloto no encontrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar piloto' });
  }
}

async function eliminarPiloto(req, res) {
  try {
    await prisma.piloto.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Piloto no encontrado' });
    }
    if (error.code === 'P2003') {
      return res.status(409).json({
        error: 'No se puede eliminar: este piloto tiene vuelos registrados en su historial.',
      });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar piloto' });
  }
}

async function subirFotoPiloto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }

    if (req.user.rol === 'piloto') {
      const pilotoDelUsuario = await prisma.piloto.findUnique({ where: { usuarioId: req.user.id } });
      if (!pilotoDelUsuario || pilotoDelUsuario.id !== req.params.id) {
        return res.status(403).json({ error: 'Solo puedes actualizar tu propia foto' });
      }
    }

    const fotoUrl = `/uploads/pilotos/${req.file.filename}`;

    const piloto = await prisma.piloto.update({
      where: { id: req.params.id },
      data: { fotoUrl },
    });

    res.json(piloto);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Piloto no encontrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al subir la foto del piloto' });
  }
}

async function miPerfil(req, res) {
  try {
    const piloto = await prisma.piloto.findUnique({
      where: { usuarioId: req.user.id },
    });

    if (!piloto) {
      return res.status(404).json({ error: 'No tienes un perfil de piloto asociado' });
    }

    res.json(piloto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tu perfil' });
  }
}

module.exports = { listarPilotos, obtenerPiloto, crearPiloto, actualizarPiloto, eliminarPiloto, subirFotoPiloto, miPerfil };