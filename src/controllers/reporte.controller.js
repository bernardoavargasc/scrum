const PDFDocument  = require('pdfkit');
const Reporte      = require('../models/reporte.model');
const asyncHandler = require('../middlewares/asyncHandler');
const path         = require('path');

// Paleta PLADIEX
const AZUL     = '#01587A';
const AZULMED  = '#5CB3C1';
const AMARILLO = '#E7BA11';
const VERDE    = '#10b981';
const GRIS     = '#64748b';

const LOGO_PATH = path.join(__dirname, '../assets/logo.png');

exports.sprintPDF = asyncHandler(async (req, res) => {
  const datos = await Reporte.datosSprint(req.params.id);
  if (!datos) return res.status(404).json({ error: 'Sprint no encontrado' });

  const { sprint, proyecto, tareas, metricas } = datos;

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="reporte_sprint_${sprint.id}.pdf"`);
  doc.pipe(res);

  const PW      = doc.page.width;   // 595.28
  const MG      = 50;
  const tableW  = PW - MG * 2;     // 495.28

  // ── GRADIENT HEADER (y: 0–88) ──────────────────────────────────────
  const grad = doc.linearGradient(0, 0, PW, 0);
  grad.stop(0,    '#4a9fb8');
  grad.stop(0.38, '#02597c');
  grad.stop(0.60, '#024a63');
  grad.stop(0.88, '#8a8a2e');
  grad.stop(1.0,  '#d9a818');
  doc.rect(0, 0, PW, 88).fill(grad);

  // ── LOGO ───────────────────────────────────────────────────────────
  // fit:[w,h] limita ambas dimensiones manteniendo el aspect ratio
  try { doc.image(LOGO_PATH, 18, 14, { fit: [76, 60] }); } catch (_) { /* omitir si falta */ }

  // ── TÍTULOS ────────────────────────────────────────────────────────
  doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold')
     .text('PLADIEX SCRUM', 108, 22, { width: PW - 118, lineBreak: false });
  doc.fillColor('#cce8f0').fontSize(11).font('Helvetica')
     .text('Reporte de Sprint', 108, 52, { width: PW - 118, lineBreak: false });

  // ── BARRA AMARILLA ─────────────────────────────────────────────────
  doc.rect(0, 88, PW, 4).fill(AMARILLO);

  // Reset cursor al inicio del contenido
  doc.x = MG;
  doc.y = 108;

  // ── DATOS DEL SPRINT ───────────────────────────────────────────────
  doc.fillColor(AZUL).fontSize(14).font('Helvetica-Bold')
     .text(sprint.nombre, MG, doc.y, { width: tableW });
  doc.moveDown(0.3);

  const fi = sprint.fecha_inicio ? String(sprint.fecha_inicio).substring(0, 10) : '—';
  const ff = sprint.fecha_fin    ? String(sprint.fecha_fin).substring(0, 10)    : '—';

  doc.fillColor(GRIS).fontSize(10).font('Helvetica');
  if (proyecto) doc.text(`Proyecto: ${proyecto.nombre}`, MG, doc.y, { width: tableW });
  doc.text(`Período: ${fi}  –  ${ff}`, MG, doc.y, { width: tableW });
  doc.text(`Estatus: ${sprint.estatus}`, MG, doc.y, { width: tableW });
  doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, MG, doc.y, { width: tableW });
  doc.moveDown(0.7);

  // ── SEPARADOR ──────────────────────────────────────────────────────
  doc.moveTo(MG, doc.y).lineTo(PW - MG, doc.y)
     .strokeColor(AZULMED).lineWidth(1.5).stroke();
  doc.moveDown(0.9);

  // ── MÉTRICAS ───────────────────────────────────────────────────────
  doc.fillColor(AZUL).fontSize(12).font('Helvetica-Bold')
     .text('Resumen del sprint', MG, doc.y, { width: tableW });
  doc.moveDown(0.5);

  const boxY  = doc.y;
  const boxH  = 66;
  const colW  = tableW / 3;

  doc.rect(MG, boxY, tableW, boxH).fill('#eaf6fb');

  const metrics = [
    { label: 'AVANCE',     value: `${metricas.avance}%`,    sub: `${metricas.puntosHechos}/${metricas.puntosTotal} pts`, color: AZUL },
    { label: 'HISTORIAS',  value: `${metricas.total}`,       sub: 'Total asignadas',                                      color: AZULMED },
    { label: 'TERMINADAS', value: `${metricas.terminadas}`,  sub: `${metricas.enProceso} en proceso`,                     color: VERDE },
  ];
  metrics.forEach((m, idx) => {
    const cx = MG + idx * colW;
    doc.fillColor(GRIS).fontSize(7.5).font('Helvetica')
       .text(m.label, cx + 10, boxY + 10, { width: colW - 20, lineBreak: false });
    doc.fillColor(m.color).fontSize(22).font('Helvetica-Bold')
       .text(m.value, cx + 10, boxY + 22, { width: colW - 20, lineBreak: false });
    doc.fillColor(GRIS).fontSize(7.5).font('Helvetica')
       .text(m.sub, cx + 10, boxY + 51, { width: colW - 20, lineBreak: false });
    if (idx < 2) {
      doc.moveTo(cx + colW, boxY + 8).lineTo(cx + colW, boxY + boxH - 8)
         .strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    }
  });

  doc.x = MG;
  doc.y = boxY + boxH + 16;

  // ── TABLA DE HISTORIAS ────────────────────────────────────────────
  doc.fillColor(AZUL).fontSize(12).font('Helvetica-Bold')
     .text('Historias del sprint', MG, doc.y, { width: tableW });
  doc.moveDown(0.5);

  const TH = { tit: MG + 5, resp: MG + 238, pts: MG + 376, est: MG + 416 };
  const headerY = doc.y;

  // Cabecera de la tabla
  doc.rect(MG, headerY - 2, tableW, 18).fill(AZUL);
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(8.5);
  doc.text('Historia',    TH.tit,  headerY + 3, { width: 228, lineBreak: false });
  doc.text('Responsable', TH.resp, headerY + 3, { width: 130, lineBreak: false });
  doc.text('Pts',         TH.pts,  headerY + 3, { width: 34,  lineBreak: false });
  doc.text('Estatus',     TH.est,  headerY + 3, { width: 95,  lineBreak: false });

  doc.x = MG;
  doc.y = headerY + 20;
  doc.font('Helvetica').fontSize(8.5);

  if (tareas.length === 0) {
    doc.fillColor(GRIS).text('Este sprint no tiene historias registradas.', MG + 5, doc.y + 6, { width: tableW });
  } else {
    tareas.forEach((t, i) => {
      if (doc.y > 750) doc.addPage();

      const ry = doc.y;
      if (i % 2 === 0) doc.rect(MG, ry - 1, tableW, 17).fill('#f0f9fc');

      const colorEst = (t.estatus === 'terminada' || t.estatus === 'done') ? VERDE
                     : (t.estatus === 'proceso'   || t.estatus === 'doing') ? '#d97706' : GRIS;

      doc.fillColor('#1e293b')
         .text((t.titulo || '').substring(0, 42), TH.tit,  ry, { width: 228, lineBreak: false });
      doc.fillColor(GRIS)
         .text(t.responsable_nombre || '—',       TH.resp, ry, { width: 130, lineBreak: false });
      doc.fillColor('#1e293b')
         .text(String(t.puntos ?? '—'),            TH.pts,  ry, { width: 34,  lineBreak: false });

      // Pill de estatus
      doc.roundedRect(TH.est - 2, ry - 1, 82, 12, 3).fill(colorEst);
      doc.fillColor('#fff').font('Helvetica-Bold')
         .text(t.estatus, TH.est + 3, ry, { width: 74, lineBreak: false });

      doc.font('Helvetica').fillColor('#1e293b');
      doc.x = MG;
      doc.y = ry + 17;
    });
  }

  // ── PIE ───────────────────────────────────────────────────────────
  doc.fillColor(GRIS).fontSize(7.5)
     .text('Documento generado automáticamente por PLADIEX SCRUM',
           MG, 818, { align: 'center', width: tableW });

  doc.end();
});
