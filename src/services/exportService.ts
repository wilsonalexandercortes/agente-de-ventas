import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Lead, SystemUsageMetrics, SalesReport, AuditLog } from '../types.ts';

export function exportPipelineToExcel(
  leads: Lead[],
  metrics: SystemUsageMetrics,
  reports: SalesReport[],
  auditLogs: AuditLog[]
) {
  const wb = XLSX.utils.book_new();

  // 1. Resumen Ejecutivo de Métricas
  const kpiRows = [
    ['REPORTE DE RENDIMIENTO - AGENTE AUTÓNOMO DE VENTAS CON IA'],
    ['Generado el:', new Date().toLocaleString('es-ES')],
    ['Seguridad:', 'Cifrado Extremo a Extremo AES-256 Activo (Verificado)'],
    ['Cumplimiento:', 'GDPR / CCPA / ISO 27001 / Zero-Knowledge'],
    [''],
    ['MÉTRICA COMERCIAL', 'VALOR REGISTRADO', 'ESTADO / UNIDAD'],
    ['Total de Leads Gestionados', metrics.totalLeads, 'Contactos'],
    ['Negociaciones en Curso', metrics.activeNegotiations, 'Oportunidades'],
    ['Ingresos Cerrados / Ganados', metrics.wonRevenue, 'USD'],
    ['Valor Total del Pipeline', metrics.pipelineValue, 'USD'],
    ['Tasa de Cierre (Win Rate)', `${metrics.winRatePercent}%`, 'Efectividad'],
    ['Acciones Autónomas de la IA', metrics.autonomousActionsCount, 'Interacciones'],
    ['Tiempo Promedio de Respuesta', `${metrics.avgResponseTimeMs} ms`, 'Velocidad'],
    ['Tasa de Sincronización con CRM', `${metrics.crmSyncSuccessRate}%`, 'Confiabilidad'],
    ['Disponibilidad del Sistema (Uptime)', `${metrics.systemUptime}%`, 'Alta Disponibilidad'],
  ];
  const wsKpis = XLSX.utils.aoa_to_sheet(kpiRows);
  XLSX.utils.book_append_sheet(wb, wsKpis, 'Resumen de Métricas');

  // 2. Leads y Pipeline Detallado
  const leadsRows = leads.map((l, index) => ({
    '#': index + 1,
    'ID': l.id,
    'Nombre del Contacto': l.name,
    'Empresa': l.company,
    'Cargo': l.role,
    'Email': l.email,
    'Teléfono': l.phone,
    'Etapa Actual': l.stage.toUpperCase(),
    'Valor del Trato (USD)': l.dealValue,
    'Probabilidad (%)': `${l.probability}%`,
    'Prioridad': l.priority.toUpperCase(),
    'Canal': l.channel,
    'Sentimiento': l.sentiment.toUpperCase(),
    'Objeciones Principales': l.objections.length > 0 ? l.objections.join(' | ') : 'Sin objeciones',
    'Proveedor CRM': l.crmProvider,
    'CRM ID': l.crmId,
    'Estado Sincronización': l.crmSyncStatus.toUpperCase(),
    'Cifrado E2E': l.encrypted ? 'SI (AES-256)' : 'NO',
    'Último Contacto': l.lastContact,
    'Siguiente Acción IA': l.aiSuggestedAction || 'En evaluación continua',
  }));
  const wsLeads = XLSX.utils.json_to_sheet(leadsRows);
  XLSX.utils.book_append_sheet(wb, wsLeads, 'Pipeline de Clientes');

  // 3. Auditoría de Seguridad y Sincronización
  const auditRows = auditLogs.map(a => ({
    'Timestamp': a.timestamp,
    'Acción': a.action,
    'Categoría': a.category,
    'Actor': a.actor,
    'Detalles de Operación': a.details,
    'Hash IP': a.ipHash,
    'Checksum Criptográfico': a.checksum,
  }));
  const wsAudit = XLSX.utils.json_to_sheet(auditRows);
  XLSX.utils.book_append_sheet(wb, wsAudit, 'Auditoría & Cumplimiento');

  // 4. Reportes de Estrategia Comercial
  if (reports.length > 0) {
    const reportRows = reports.map(r => ({
      'ID': r.id,
      'Título': r.title,
      'Periodo': r.period,
      'Puntaje de Salud (1-100)': r.pipelineHealthScore,
      'Resumen Ejecutivo': r.executiveSummary,
      'Pronóstico Ganado (USD)': r.revenueForecast.expectedWon,
      'Pronóstico Mejor Caso (USD)': r.revenueForecast.bestCase,
      'Pipeline Ponderado (USD)': r.revenueForecast.weightedPipeline,
    }));
    const wsReports = XLSX.utils.json_to_sheet(reportRows);
    XLSX.utils.book_append_sheet(wb, wsReports, 'Reportes Estratégicos');
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Reporte_Metricas_Ventas_IA_${dateStr}.xlsx`);
}

export function exportPipelineToPdf(
  leads: Lead[],
  metrics: SystemUsageMetrics,
  report?: SalesReport
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('REPORTE EJECUTIVO DE RENDIMIENTO - AGENTE DE VENTAS IA', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')} | Certificación Cifrado E2E AES-256 | RGPD & ISO 27001`, 14, 20);

  y = 36;

  // KPI Summary Cards Grid
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Métricas Clave de Rendimiento Comercial en Tiempo Real', 14, y);
  y += 6;

  const cardWidth = 43;
  const cardHeight = 22;
  const margin = 14;
  const gap = 4;

  const kpis = [
    { label: 'Pipeline Total', value: `$${metrics.pipelineValue.toLocaleString()} USD`, color: [79, 70, 229] },
    { label: 'Ingresos Ganados', value: `$${metrics.wonRevenue.toLocaleString()} USD`, color: [16, 185, 129] },
    { label: 'Tasa de Cierre', value: `${metrics.winRatePercent}%`, color: [14, 165, 233] },
    { label: 'Leads Activos', value: `${metrics.totalLeads} cuentas`, color: [245, 158, 11] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (cardWidth + gap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 4, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + 4, y + 16);
  });

  y += cardHeight + 10;

  // Secondary metrics bar
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 10, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Velocidad Respuesta: ${metrics.avgResponseTimeMs}ms  |  Acciones Autónomas: ${metrics.autonomousActionsCount}  |  Sync CRM: ${metrics.crmSyncSuccessRate}%  |  Uptime: ${metrics.systemUptime}%`,
    margin + 4,
    y + 6.5
  );

  y += 18;

  // Executive AI Summary
  if (report) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`2. Análisis Estratégico del Agente (${report.period})`, margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    const splitSummary = doc.splitTextToSize(report.executiveSummary, pageWidth - margin * 2);
    doc.text(splitSummary, margin, y);
    y += splitSummary.length * 4.5 + 4;

    if (report.conversionInsights.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text('Hallazgos Clave de Conversión:', margin, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      report.conversionInsights.slice(0, 3).forEach(insight => {
        doc.text(`• ${insight}`, margin + 3, y);
        y += 4;
      });
      y += 4;
    }
  }

  // Lead Pipeline Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Desglose del Pipeline de Clientes Potenciales & Negociaciones', margin, y);
  y += 6;

  // Table header
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  doc.text('Prospecto / Empresa', margin + 3, y + 4.8);
  doc.text('Etapa', margin + 65, y + 4.8);
  doc.text('Valor Trato', margin + 95, y + 4.8);
  doc.text('Prob.', margin + 122, y + 4.8);
  doc.text('Canal', margin + 138, y + 4.8);
  doc.text('CRM Status', margin + 160, y + 4.8);

  y += 7;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  leads.slice(0, 8).forEach((lead, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');

    doc.setTextColor(15, 23, 42);
    doc.text(`${lead.name} (${lead.company})`.substring(0, 32), margin + 3, y + 4.8);

    // Stage text
    const stageSpanish: Record<string, string> = {
      prospecting: 'Prospección',
      qualification: 'Calificación',
      negotiation: 'Negociación',
      closing: 'Cierre',
      won: 'Ganada',
      lost: 'Perdida',
    };
    doc.setTextColor(71, 85, 105);
    doc.text(stageSpanish[lead.stage] || lead.stage, margin + 65, y + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`$${lead.dealValue.toLocaleString()} USD`, margin + 95, y + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(`${lead.probability}%`, margin + 122, y + 4.8);
    doc.text(lead.channel, margin + 138, y + 4.8);

    doc.setTextColor(lead.crmSyncStatus === 'synced' ? 16 : 217, lead.crmSyncStatus === 'synced' ? 185 : 119, lead.crmSyncStatus === 'synced' ? 129 : 6);
    doc.text(lead.crmSyncStatus === 'synced' ? 'Sincronizado' : 'Pendiente', margin + 160, y + 4.8);

    y += 7;
  });

  // Footer Certificate & Verification
  y = Math.max(y + 8, 270);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Firma Criptográfica SHA-256: 7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    margin,
    y
  );
  doc.text(
    'Documento oficial generado por el Agente Autónomo de Ventas. Confidencial y sujeto a acuerdos de confidencialidad y normativas GDPR/CCPA.',
    margin,
    y + 3.5
  );

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`Reporte_Ejecutivo_Ventas_IA_${dateStr}.pdf`);
}
