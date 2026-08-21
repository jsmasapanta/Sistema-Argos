const prisma = require('../config/prisma');

async function listarVuelos(req, res) {
  try {
    const vuelos = await prisma.vuelo.findMany({
      include: {
        piloto: { select: { nombre: true, licencia: true, fotoUrl: true } },
        uav: { select: { codigo: true, modelo: true } },
      },
      orderBy: { fechaInicio: 'desc' },
    });
    res.json(vuelos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar vuelos' });
  }
}

async function obtenerVuelo(req, res) {
  try {
    const vuelo = await prisma.vuelo.findUnique({
      where: { id: req.params.id },
      include: { piloto: true, uav: true },
    });
    if (!vuelo) return res.status(404).json({ error: 'Vuelo no encontrado' });
    res.json(vuelo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener vuelo' });
  }
}

// Un piloto solo ve sus propios vuelos; admin/operador ven todos
async function misVuelos(req, res) {
  try {
    const piloto = await prisma.piloto.findUnique({ where: { usuarioId: req.user.id } });
    if (!piloto) return res.status(404).json({ error: 'No tienes un perfil de piloto asociado' });

    const vuelos = await prisma.vuelo.findMany({
      where: { pilotoId: piloto.id },
      include: { uav: { select: { codigo: true, modelo: true } } },
      orderBy: { fechaInicio: 'desc' },
    });
    res.json(vuelos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tus vuelos' });
  }
}

async function crearVuelo(req, res) {
  try {
    const { pilotoId, uavId, fechaInicio, fechaFin, novedades, estado, mision, objetivo, areaSector, rutaCoordenadas, condicionesClimaticas, bateriaUtilizada } = req.body || {};

    if (!pilotoId || !uavId || !fechaInicio || !fechaFin) {
      return res.status(400).json({
        error: 'pilotoId, uavId, fechaInicio y fechaFin son requeridos',
      });
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (fin <= inicio) {
      return res.status(400).json({ error: 'fechaFin debe ser posterior a fechaInicio' });
    }

    // Regla de negocio: el UAV no puede tener otro vuelo que se traslape en el tiempo
    const conflicto = await prisma.vuelo.findFirst({
      where: {
        uavId,
        AND: [
          { fechaInicio: { lt: fin } },
          { fechaFin: { gt: inicio } },
        ],
      },
    });

    if (conflicto) {
      return res.status(409).json({ error: 'Este UAV ya tiene un vuelo registrado en ese rango de fechas/horas' });
    }

    const uav = await prisma.uAV.findUnique({ where: { id: uavId } });
    if (!uav) return res.status(404).json({ error: 'UAV no encontrado' });
    if (uav.estado !== 'operativo') {
      return res.status(400).json({ error: `El UAV no está operativo (estado actual: ${uav.estado})` });
    }

    const horasVuelo = (fin - inicio) / (1000 * 60 * 60); // milisegundos a horas

    // Transacción: crear el vuelo Y sumar horas al UAV al mismo tiempo (todo o nada)
    const [vuelo] = await prisma.$transaction([
      prisma.vuelo.create({
        data: {
          pilotoId, uavId, fechaInicio: inicio, fechaFin: fin, novedades,
          estado: estado || 'completado',
          mision: mision || undefined,
          objetivo: objetivo || undefined,
          areaSector: areaSector || undefined,
          rutaCoordenadas: rutaCoordenadas || undefined,
          condicionesClimaticas: condicionesClimaticas || undefined,
          bateriaUtilizada: bateriaUtilizada ? parseInt(bateriaUtilizada) : undefined,
        },
      }),
      prisma.uAV.update({
        where: { id: uavId },
        data: { horasTotales: { increment: Math.round(horasVuelo) } },
      }),
    ]);

    res.status(201).json(vuelo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear vuelo' });
  }
}

async function actualizarVuelo(req, res) {
  try {
    const { novedades, estado, mision, objetivo, areaSector, rutaCoordenadas, condicionesClimaticas, bateriaUtilizada } = req.body || {};
    const vuelo = await prisma.vuelo.update({
      where: { id: req.params.id },
      data: {
        novedades,
        estado: estado || undefined,
        mision: mision !== undefined ? (mision || null) : undefined,
        objetivo: objetivo !== undefined ? (objetivo || null) : undefined,
        areaSector: areaSector !== undefined ? (areaSector || null) : undefined,
        rutaCoordenadas: rutaCoordenadas !== undefined ? (rutaCoordenadas || null) : undefined,
        condicionesClimaticas: condicionesClimaticas !== undefined ? (condicionesClimaticas || null) : undefined,
        bateriaUtilizada: bateriaUtilizada !== undefined ? (bateriaUtilizada ? parseInt(bateriaUtilizada) : null) : undefined,
      },
    });
    res.json(vuelo);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Vuelo no encontrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar vuelo' });
  }
}

module.exports = { listarVuelos, obtenerVuelo, misVuelos, crearVuelo, actualizarVuelo };