const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { authenticate, checkRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', authenticate, checkRole('admin'), async (req, res) => {
  try {
    const { email, password, rol } = req.body;

    if (!email || !password || !rol) {
      return res.status(400).json({ error: 'email, password y rol son requeridos' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: { email, passwordHash, rol },
    });

    res.status(201).json({ id: usuario.id, email: usuario.email, rol: usuario.rol });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email y password son requeridos' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Esta cuenta ha sido desactivada. Contacta a un administrador.' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.get('/usuarios', authenticate, checkRole('admin'), async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, email: true, rol: true, activo: true, creadoEn: true, ultimoAcceso: true },
      orderBy: { creadoEn: 'desc' },
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
});

router.put('/usuarios/:id/estado', authenticate, checkRole('admin'), async (req, res) => {
  try {
    const { activo } = req.body || {};

    if (typeof activo !== 'boolean') {
      return res.status(400).json({ error: 'El campo activo debe ser true o false' });
    }

    const usuarioActual = await prisma.usuario.findUnique({ where: { id: req.params.id } });
    if (usuarioActual?.rol === 'admin' && activo === false) {
      const totalAdmins = await prisma.usuario.count({ where: { rol: 'admin', activo: true } });
      if (totalAdmins <= 1) {
        return res.status(400).json({ error: 'No se puede desactivar: es el único administrador activo del sistema' });
      }
    }

    const usuario = await prisma.usuario.update({
      where: { id: req.params.id },
      data: { activo },
      select: { id: true, email: true, rol: true, activo: true },
    });

    res.json(usuario);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el estado del usuario' });
  }
});

router.put('/usuarios/:id/rol', authenticate, checkRole('admin'), async (req, res) => {
  try {
    const { rol } = req.body || {};
    const rolesValidos = ['admin', 'operador', 'piloto'];

    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido. Debe ser admin, operador o piloto' });
    }

    const usuarioActual = await prisma.usuario.findUnique({ where: { id: req.params.id } });
    if (usuarioActual?.rol === 'admin' && rol !== 'admin') {
      const totalAdmins = await prisma.usuario.count({ where: { rol: 'admin', activo: true } });
      if (totalAdmins <= 1) {
        return res.status(400).json({ error: 'No se puede cambiar el rol: es el único administrador activo del sistema' });
      }
    }

    const usuario = await prisma.usuario.update({
      where: { id: req.params.id },
      data: { rol },
      select: { id: true, email: true, rol: true, activo: true },
    });

    res.json(usuario);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el rol del usuario' });
  }
});

router.delete('/usuarios/:id', authenticate, checkRole('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: req.params.id } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.rol === 'admin') {
      const totalAdmins = await prisma.usuario.count({ where: { rol: 'admin', activo: true } });
      if (totalAdmins <= 1) {
        return res.status(400).json({ error: 'No se puede eliminar: es el único administrador activo del sistema' });
      }
    }

    await prisma.usuario.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(409).json({
        error: 'No se puede eliminar: este usuario tiene UAVs, pilotos o registros creados. Desactívalo en vez de eliminarlo.',
      });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

module.exports = router;