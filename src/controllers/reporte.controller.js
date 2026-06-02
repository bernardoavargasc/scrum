const PDFDocument = require('pdfkit');
const Reporte = require('../models/reporte.model');
const asyncHandler = require('../middlewares/asyncHandler');

// Paleta PLADIEX
const AZUL    = '#01587A';
const AZULMED = '#5CB3C1';
const GRIS    = '#64748b';
const VERDE   = '#10b981';

exports.sprintPDF = asyncHandler(async (req, res) => {
  const datos = await Reporte.datosSprint(req.params.id);
  if (!datos) return res.status(404).json({ error: 'Sprint no encontrado' });

  const { sprint, proyecto, tareas, metricas } = datos;

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const nombreArchivo = `reporte_sprint_${sprint.id}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
  doc.pipe(res);

  // ----- Encabezado -----
  doc.fillColor(AZUL).fontSize(22).font('Helvetica-Bold')
     .text('PLADIEX SCRUM', { align: 'left' });
  doc.fillColor(GRIS).fontSize(11).font('Helvetica')
     .text('Reporte de Sprint', { align: 'left' });
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(AZULMED).lineWidth(2).stroke();
  doc.moveDown(1);

  // ----- Datos del sprint -----
  doc.fillColor(AZUL).fontSize(15).font('Helvetica-Bold').text(sprint.nombre);
  doc.moveDown(0.3);
  doc.fillColor(GRIS).fontSize(10).font('Helvetica');
  if (proyecto) doc.text(`Proyecto: ${proyecto.nombre}`);
  const fi = sprint.fecha_inicio ? String(sprint.fecha_inicio).substring(0,10) : '—';
  const ff = sprint.fecha_fin    ? String(sprint.fecha_fin).substring(0,10)    : '—';
  doc.text(`Periodo: ${fi}  a  ${ff}`);
  doc.text(`Estatus: ${sprint.estatus}`);
  doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`);
  doc.moveDown(1);

  // ----- Resumen de métricas -----
  doc.fillColor(AZUL).fontSize(13).font('Helvetica-Bold').text('Resumen');
  doc.moveDown(0.4);
  const resumen = [
    ['Avance (puntos)',       `${metricas.avance}%  (${metricas.puntosHechos}/${metricas.puntosTotal} pts)`],
    ['Historias totales',     `${metricas.total}`],
    ['Terminadas',            `${metricas.terminadas}`],
    ['En proceso',            `${metricas.enProceso}`],
    ['Disponibles',           `${metricas.disponibles}`],
  ];
  doc.fontSize(10).font('Helvetica');
  resumen.forEach(([k, v]) => {
    doc.fillColor(GRIS).text(k, 60, doc.y, { continued: true, width: 200 });
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(`   ${v}`);
    doc.font('Helvetica');
  });
  doc.moveDown(1);

  // ----- Tabla de tareas -----
  doc.fillColor(AZUL).fontSize(13).font('Helvetica-Bold').text('Historias del sprint');
  doc.moveDown(0.5);

  const colX = { titulo: 55, resp: 290, pts: 420, est: 460 };
  const headerY = doc.y;
  doc.fontSize(9).fillColor('#fff');
  doc.rect(50, headerY - 2, 495, 18).fill(AZUL);
  doc.fillColor('#fff').font('Helvetica-Bold');
  doc.text('Historia',     colX.titulo, headerY + 2);
  doc.text('Responsable',  colX.resp,   headerY + 2);
  doc.text('Pts',          colX.pts,    headerY + 2);
  doc.text('Estatus',      colX.est,    headerY + 2);
  doc.moveDown(1.2);

  doc.font('Helvetica').fontSize(9);
  if (tareas.length === 0) {
    doc.fillColor(GRIS).text('Este sprint no tiene historias registradas.', 55, doc.y + 4);
  } else {
    tareas.forEach((t, i) => {
      const y = doc.y;
      if (i % 2 === 0) doc.rect(50, y - 2, 495, 16).fill('#f0f9fc');
      const colorEst = t.estatus === 'terminada' ? VERDE
                     : t.estatus === 'proceso'   ? '#d97706' : GRIS;
      doc.fillColor('#1e293b').text((t.titulo || '').substring(0, 45), colX.titulo, y, { width: 225 });
      doc.fillColor(GRIS).text(t.responsable_nombre || '—', colX.resp, y, { width: 120 });
      doc.fillColor('#1e293b').text(String(t.puntos ?? '—'), colX.pts, y);
      doc.fillColor(colorEst).font('Helvetica-Bold').text(t.estatus, colX.est, y);
      doc.font('Helvetica');
      doc.moveDown(0.5);
      // Salto de página si se acaba el espacio
      if (doc.y > 760) { doc.addPage(); }
    });
  }

  // ----- Pie -----
  doc.fontSize(8).fillColor(GRIS)
     .text('Documento generado automáticamente por PLADIEX SCRUM', 50, 800, { align: 'center', width: 495 });

  doc.end();
});
