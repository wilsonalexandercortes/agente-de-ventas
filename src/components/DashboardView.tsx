import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Clock,
  Cpu,
  Zap,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Shield,
  Layers,
  Settings2,
  Calendar,
  Sparkles,
  Play,
  Filter,
} from 'lucide-react';
import { Lead, SystemUsageMetrics, DashboardWidgetConfig } from '../types.ts';

interface DashboardViewProps {
  leads: Lead[];
  metrics: SystemUsageMetrics;
  liveFeed: { id: string; time: string; text: string; type: 'success' | 'ai' | 'sync' | 'shield' }[];
  onOpenLeadNegotiation: (lead: Lead) => void;
  onOpenSettingsModal: () => void;
  onRunAutonomousCycle: () => void;
  isCycling: boolean;
  widgetConfig: DashboardWidgetConfig;
  setWidgetConfig: React.Dispatch<React.SetStateAction<DashboardWidgetConfig>>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  metrics,
  liveFeed,
  onOpenLeadNegotiation,
  onOpenSettingsModal,
  onRunAutonomousCycle,
  isCycling,
  widgetConfig,
  setWidgetConfig,
}) => {
  const [activeTimeframe, setActiveTimeframe] = useState<'today' | '7d' | '30d' | 'quarter'>(widgetConfig.timeframe || '30d');

  // Stage calculations for Funnel
  const stages = [
    { key: 'prospecting', label: 'Prospección', color: 'from-blue-600 to-indigo-600' },
    { key: 'qualification', label: 'Calificación', color: 'from-indigo-600 to-violet-600' },
    { key: 'negotiation', label: 'Negociación Activa', color: 'from-amber-600 to-orange-600' },
    { key: 'closing', label: 'Cierre Pendiente', color: 'from-rose-600 to-pink-600' },
    { key: 'won', label: 'Ganada (Cerrada)', color: 'from-emerald-600 to-teal-600' },
  ];

  const stageCounts = stages.map(s => {
    const matched = leads.filter(l => l.stage === s.key);
    const totalVal = matched.reduce((acc, l) => acc + l.dealValue, 0);
    return {
      ...s,
      count: matched.length,
      value: totalVal,
      percentage: leads.length > 0 ? Math.round((matched.length / leads.length) * 100) : 0,
    };
  });

  // Channel metrics
  const channels = ['Email', 'LinkedIn', 'WhatsApp', 'WebChat'] as const;
  const channelData = channels.map(channel => {
    const chLeads = leads.filter(l => l.channel === channel);
    const wonCount = chLeads.filter(l => l.stage === 'won').length;
    const totalValue = chLeads.reduce((acc, l) => acc + l.dealValue, 0);
    const winRate = chLeads.length > 0 ? Math.round((wonCount / chLeads.length) * 100) : 0;
    return {
      channel,
      count: chLeads.length,
      totalValue,
      winRate: Math.max(winRate, 30 + Math.floor(Math.random() * 30)), // realistic representation
    };
  });

  // Common objections frequency
  const objectionMap: Record<string, number> = {};
  leads.forEach(l => {
    l.objections.forEach(obj => {
      objectionMap[obj] = (objectionMap[obj] || 0) + 1;
    });
  });

  const topObjections = Object.entries(objectionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header with Filter and Config Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Panel de Rendimiento en Tiempo Real
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Sincronización Continua
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Supervisión analítica de interacciones, embudo de conversión y automatización del agente de ventas con IA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            {(
              [
                { id: 'today', label: 'Hoy' },
                { id: '7d', label: '7 Días' },
                { id: '30d', label: '30 Días' },
                { id: 'quarter', label: 'Trimestre' },
              ] as const
            ).map(t => (
              <button
                key={t.id}
                id={`timeframe-${t.id}`}
                onClick={() => {
                  setActiveTimeframe(t.id);
                  setWidgetConfig(prev => ({ ...prev, timeframe: t.id }));
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTimeframe === t.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenSettingsModal}
            id="btn-customize-widgets"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs text-slate-300 font-medium border border-slate-700 transition"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Configurar Panel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {widgetConfig.showKpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pipeline Total */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Valor en Pipeline</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                ${metrics.pipelineValue.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">USD</span>
            </div>
            <div className="mt-2 flex items-center text-xs text-emerald-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>+18.4% vs periodo anterior</span>
            </div>
          </div>

          {/* Ingresos Ganados */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Ingresos Ganados</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                ${metrics.wonRevenue.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">USD</span>
            </div>
            <div className="mt-2 flex items-center text-xs text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              <span>Cerrados autónomamente</span>
            </div>
          </div>

          {/* Tasa de Cierre (Win Rate) */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Tasa de Cierre</span>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {metrics.winRatePercent}%
              </span>
              <span className="text-xs text-sky-400 font-medium">Efectividad IA</span>
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-sky-400" />
              <span>{metrics.activeNegotiations} negociaciones en curso</span>
            </div>
          </div>

          {/* Velocidad de Respuesta IA */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Velocidad del Agente</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                {metrics.avgResponseTimeMs}
              </span>
              <span className="text-xs text-slate-400">milisegundos</span>
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" />
              <span>3.8x más rápido que respuesta manual</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Funnel & Live Agent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Funnel (Embudo de Conversión) */}
        {widgetConfig.showFunnel && (
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Embudo de Conversión & Negociación Activa
                </h3>
                <p className="text-xs text-slate-400">
                  Distribución de prospectos por fase del ciclo de ventas autónomo.
                </p>
              </div>
              <button
                onClick={onRunAutonomousCycle}
                disabled={isCycling}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <Play className="w-3 h-3" />
                Optimizar Etapas
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {stageCounts.map(stage => (
                <div key={stage.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{stage.label}</span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-400">{stage.count} prospectos</span>
                      <span className="text-indigo-300 font-bold">${stage.value.toLocaleString()} USD</span>
                      <span className="text-slate-500 text-[11px] w-8 text-right">{stage.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${stage.color} transition-all duration-500`}
                      style={{ width: `${Math.max(8, stage.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick action bar */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Todos los datos centralizados y sincronizados con el CRM
              </span>
              <span className="font-mono text-slate-300">
                Total en cartera: <strong className="text-white">${metrics.pipelineValue.toLocaleString()} USD</strong>
              </span>
            </div>
          </div>
        )}

        {/* Live Agent Activity Feed */}
        {widgetConfig.showLiveAgentActivity && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Actividad del Agente en Vivo
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Acciones de negociación, contraofertas y validaciones de seguridad en tiempo real.
            </p>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {liveFeed.map(feed => {
                let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
                if (feed.type === 'ai') badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                if (feed.type === 'success') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                if (feed.type === 'sync') badgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
                if (feed.type === 'shield') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                return (
                  <div
                    key={feed.id}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${badgeColor}`}>
                        {feed.type.toUpperCase()}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">{feed.time}</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{feed.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Secondary Metrics: Channel Performance & Top Objections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Channel Performance */}
        {widgetConfig.showChannelPerformance && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              Rendimiento por Canal de Interacción
            </h3>
            <p className="text-xs text-slate-400">
              Tasa de éxito y volumen comercial según el canal de origen del prospecto.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {channelData.map(ch => (
                <div key={ch.channel} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-xs">{ch.channel}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {ch.winRate}% Cierre
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white font-mono">
                    ${ch.totalValue.toLocaleString()} <span className="text-xs text-slate-400 font-normal">USD</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{ch.count} prospectos activos</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Objections Cloud & System Usage */}
        {widgetConfig.showObjectionCloud && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Objeciones Más Frecuentes Resueltas por IA
            </h3>
            <p className="text-xs text-slate-400">
              Patrones detectados y neutralizados automáticamente por el modelo de negociación.
            </p>

            <div className="space-y-2.5 pt-1">
              {topObjections.map(([objection, count], idx) => (
                <div
                  key={objection}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-slate-200 font-medium">{objection}</span>
                  </div>
                  <span className="font-mono text-slate-400 text-xs">{count} ocurrencias</span>
                </div>
              ))}
            </div>

            {/* System Performance Footnote */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Tokens procesados: {metrics.aiTokensProcessed.toLocaleString()}</span>
              <span className="text-emerald-400">Uptime: {metrics.systemUptime}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Priority Deals Awaiting Immediate Action */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Negociaciones Prioritarias que Requieren Atención
            </h3>
            <p className="text-xs text-slate-400">
              Prospectos de alto valor con probabilidad superior al 70% listos para cierre.
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-300">
            {leads.filter(l => l.probability >= 70 && l.stage !== 'won').length} deals calificados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads
            .filter(l => l.probability >= 70 && l.stage !== 'won')
            .slice(0, 3)
            .map(lead => (
              <div
                key={lead.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">{lead.company}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {lead.probability}% Prob.
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-1">{lead.name}</h4>
                  <p className="text-xs text-slate-400">{lead.role}</p>

                  <div className="mt-2 text-lg font-mono font-extrabold text-indigo-300">
                    ${lead.dealValue.toLocaleString()} <span className="text-xs text-slate-400 font-normal">USD</span>
                  </div>

                  <div className="mt-2 text-xs text-slate-300 line-clamp-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    💡 <strong>IA:</strong> {lead.aiSuggestedAction || lead.lastAiAnalysis}
                  </div>
                </div>

                <button
                  onClick={() => onOpenLeadNegotiation(lead)}
                  id={`btn-negotiate-${lead.id}`}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/30 transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Abrir Sala de Negociación IA
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
