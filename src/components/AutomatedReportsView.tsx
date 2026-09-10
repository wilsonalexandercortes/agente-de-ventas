import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  Award,
} from 'lucide-react';
import { SalesReport, Lead, SystemUsageMetrics, AuditLog } from '../types.ts';
import { exportPipelineToExcel, exportPipelineToPdf } from '../services/exportService.ts';

interface AutomatedReportsViewProps {
  reports: SalesReport[];
  leads: Lead[];
  metrics: SystemUsageMetrics;
  auditLogs: AuditLog[];
  onGenerateReport: (period: string) => Promise<void>;
  isGenerating: boolean;
}

export const AutomatedReportsView: React.FC<AutomatedReportsViewProps> = ({
  reports,
  leads,
  metrics,
  auditLogs,
  onGenerateReport,
  isGenerating,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Últimos 30 Días');
  const [activeReportIndex, setActiveReportIndex] = useState<number>(0);

  const currentReport = reports[activeReportIndex] || reports[0];

  const handleExportExcel = () => {
    exportPipelineToExcel(leads, metrics, reports, auditLogs);
  };

  const handleExportPdf = () => {
    exportPipelineToPdf(leads, metrics, currentReport);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Reportes Automatizados Detallados para el Equipo de Ventas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Análisis ejecutivo generado por IA sobre salud del pipeline, cuellos de botella y previsión de ingresos.
            </p>
          </div>
        </div>

        {/* Action Buttons: Export Excel and PDF */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            id="btn-export-excel-main"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar a Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPdf}
            id="btn-export-pdf-main"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>Exportar a PDF (.pdf)</span>
          </button>
        </div>
      </div>

      {/* Trigger New Report Generation with Gemini AI */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Sintetizar Nuevo Informe Estratégico con IA
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            El modelo Gemini procesará todos los tratos activos, tasas de conversión y objeciones registradas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="Últimos 7 Días">Últimos 7 Días</option>
            <option value="Últimos 30 Días">Últimos 30 Días</option>
            <option value="Trimestre Q3">Trimestre Q3</option>
            <option value="Año en Curso">Año en Curso</option>
          </select>

          <button
            onClick={() => onGenerateReport(selectedPeriod)}
            disabled={isGenerating}
            id="btn-trigger-ai-report"
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generar Informe Ahora</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Report View */}
      {currentReport && (
        <div className="space-y-6">
          {/* Report Meta Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono uppercase text-indigo-400 font-semibold tracking-wider">
                  {currentReport.period}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{currentReport.title}</h3>
                <p className="text-xs text-slate-400">
                  Emitido el: {new Date(currentReport.generatedAt).toLocaleString()} • Modelo: Gemini 3.8 Flash
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400">Score de Salud Pipeline:</span>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {currentReport.pipelineHealthScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Resumen Ejecutivo:
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">{currentReport.executiveSummary}</p>
            </div>

            {/* Revenue Forecast Grid */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
                Previsión de Ingresos Modelada por IA:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Cierre Esperado (Probable)</span>
                  <div className="text-xl font-mono font-extrabold text-white">
                    ${currentReport.revenueForecast.expectedWon.toLocaleString()} USD
                  </div>
                  <p className="text-[11px] text-emerald-400">Basado en velocidad de tratos actuales</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Mejor Escenario (Best Case)</span>
                  <div className="text-xl font-mono font-extrabold text-sky-400">
                    ${currentReport.revenueForecast.bestCase.toLocaleString()} USD
                  </div>
                  <p className="text-[11px] text-sky-300">Con cierre de cuentas en etapa de propuesta</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Pipeline Ponderado</span>
                  <div className="text-xl font-mono font-extrabold text-indigo-300">
                    ${currentReport.revenueForecast.weightedPipeline.toLocaleString()} USD
                  </div>
                  <p className="text-[11px] text-indigo-400">Ajustado según probabilidad histórica</p>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Insights & Bottlenecks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conversion Insights */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Hallazgos Clave de Conversión
              </h4>
              <div className="space-y-2.5">
                {currentReport.conversionInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Bottlenecks */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Cuellos de Botella Detectados por IA
              </h4>
              <div className="space-y-2.5">
                {currentReport.keyBottlenecks.map((bottleneck, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{bottleneck}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Objection Trends & Recommendations */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-indigo-400" />
              Recomendaciones Estratégicas para el Equipo Comercial
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentReport.strategicRecommendations.map((rec, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                  <span className="font-mono text-indigo-400 font-bold text-[10px]">RECOMENDACIÓN #{i + 1}</span>
                  <p className="text-slate-200">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
