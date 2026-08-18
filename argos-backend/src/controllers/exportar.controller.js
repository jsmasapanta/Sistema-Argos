const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const prisma = require('../config/prisma');

async function obtenerDatosReporte() {
  const [uavs, pilotos, vuelos, mantenimientos] = await Promise.all([
    prisma.uAV.findMany({ orderBy: { codigo: 'asc' } }),
    prisma.piloto.findMany({ include: { vuelos: true }, orderBy: { nombre: 'asc' } }),
    prisma.vuelo.count(),
    prisma.mantenimiento.findMany({ include: { uav: true }, orderBy: { fecha: 'desc' } }),
  ]);

  const horasPorPiloto = pilotos.map((p) => {
    const horas = p.vuelos.reduce((acc, v) => acc + (v.fechaFin - v.fechaInicio) / (1000 * 60 * 60), 0);
    return { nombre: p.nombre, licencia: p.licencia, totalVuelos: p.vuelos.length, horas: Math.round(horas * 10) / 10 };
  });

  return { uavs, horasPorPiloto, totalVuelos: vuelos, mantenimientos };
}

async function exportarPDF(req, res) {
  try {
    const { uavs, horasPorPiloto, totalVuelos, mantenimientos } = await obtenerDatosReporte();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-argos.pdf"');

    const doc = new PDFDocument({ margin: 50, font: 'Helvetica' });
    doc.pipe(res);
    doc.font('Helvetica');

    doc.fontSize(20).text('SISTEMA ARGOS — Reporte General', { align: 'center' });
    doc.fontSize(10).fillColor('#666').text(`GMREC · Generado el ${new Date().toLocaleDateString('es-EC')}`, { align: 'center' });
    doc.moveDown(2);

    doc.fillColor('#000').fontSize(14).text('Resumen general');
    doc.fontSize(10).text(`UAVs registrados: ${uavs.length}`);
    doc.text(`UAVs operativos: ${uavs.filter((u) => u.estado === 'operativo').length}`);
    doc.text(`Vuelos registrados: ${totalVuelos}`);
    doc.moveDown(1.5);

    doc.fontSize(14).text('UAVs');
    uavs.forEach((u) => {
      doc.fontSize(10).text(`${u.codigo} — ${u.modelo} — ${u.estado} — ${u.horasTotales} h totales`);
    });
    doc.moveDown(1.5);

    doc.fontSize(14).text('Horas por piloto');
    horasPorPiloto.forEach((p) => {
      doc.fontSize(10).text(`${p.nombre} (${p.licencia}) — ${p.totalVuelos} vuelo(s) — ${p.horas} h`);
    });
    doc.moveDown(1.5);

    doc.fontSize(14).text('Historial de mantenimiento');
    if (mantenimientos.length === 0) {
      doc.fontSize(10).text('Sin mantenimientos registrados.');
    } else {
      mantenimientos.forEach((m) => {
        doc.fontSize(10).text(`${m.uav.codigo} — ${m.tipo} — ${new Date(m.fecha).toLocaleDateString('es-EC')} — ${m.descripcion || 'Sin descripción'}`);
      });
    }

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
}

async function exportarExcel(req, res) {
  try {
    const { uavs, horasPorPiloto, mantenimientos } = await obtenerDatosReporte();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema ARGOS';

    const hojaUAVs = workbook.addWorksheet('UAVs');
    hojaUAVs.columns = [
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Modelo', key: 'modelo', width: 25 },
      { header: 'Estado', key: 'estado', width: 18 },
      { header: 'Horas totales', key: 'horasTotales', width: 15 },
    ];
    hojaUAVs.addRows(uavs);
    hojaUAVs.getRow(1).font = { bold: true };

    const hojaPilotos = workbook.addWorksheet('Horas por Piloto');
    hojaPilotos.columns = [
      { header: 'Nombre', key: 'nombre', width: 25 },
      { header: 'Licencia', key: 'licencia', width: 20 },
      { header: 'Vuelos', key: 'totalVuelos', width: 12 },
      { header: 'Horas', key: 'horas', width: 12 },
    ];
    hojaPilotos.addRows(horasPorPiloto);
    hojaPilotos.getRow(1).font = { bold: true };

    const hojaMantenimiento = workbook.addWorksheet('Mantenimiento');
    hojaMantenimiento.columns = [
      { header: 'UAV', key: 'uav', width: 15 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Tipo', key: 'tipo', width: 20 },
      { header: 'Descripción', key: 'descripcion', width: 35 },
    ];
    mantenimientos.forEach((m) => {
      hojaMantenimiento.addRow({
        uav: m.uav.codigo,
        fecha: new Date(m.fecha).toLocaleDateString('es-EC'),
        tipo: m.tipo,
        descripcion: m.descripcion || '',
      });
    });
    hojaMantenimiento.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-argos.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el Excel' });
  }
}

module.exports = { exportarPDF, exportarExcel };