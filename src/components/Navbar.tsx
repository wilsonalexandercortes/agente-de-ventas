import React from 'react';
import {
  Bot,
  ShieldCheck,
  RefreshCw,
  Sliders,
  FileSpreadsheet,
  FileText,
  Activity,
  Users,
  MessageSquareCode,
  Lock,
  Database,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { AgentConfig, SystemUsageMetrics } from '../types.ts';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  agentConfig?: AgentConfig | null;
  metrics?: SystemUsageMetrics;
  onOpenAgentSettings?: () => void;
  onOpenConfig?: () => void;
  onRunAutonomousCycle: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  isCycling: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  agentConfig,
  metrics,
  onOpenAgentSettings,
  onOpenConfig,
  onRunAutonomousCycle,
  onExportExcel,
  onExportPdf,
  isCycling,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Panel en Tiempo Real', icon: Activity },
    { id: 'pipeline', label: 'Clientes & Negociación', icon: Users },
    { id: 'customizer', label: 'Personalización LLM', icon: MessageSquareCode },
    { id: 'crm', label: 'Sincronización CRM', icon: Database },
    { id: 'reports', label: 'Reportes Automatizados', icon: FileText },
    { id: 'security', label: 'Seguridad & Cifrado E2E', icon: Lock },
  ];

  const getAutonomyBadge = () => {
    switch (agentConfig?.autonomyLevel) {
      case 'full':
        return { label: 'Autonomía Total', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'semi':
        return { label: 'Semi-Autónomo', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'supervised':
        return { label: 'Supervisado', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' };
      default:
        return { label: 'Autónomo IA', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    }
  };

  const badge = getAutonomyBadge();
  const syncRate = metrics?.crmSyncSuccessRate ?? 99.4;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      {/* Top Banner with Brand and Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">
                Nexus Sales <span className="text-indigo-400 font-mono text-xs px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">AI</span>
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Agente Autónomo de Ventas, Negociación & Cierre Continuo
            </p>
          </div>
        </div>

        {/* Security & Sync Live Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-slate-200">Cifrado E2E AES-256</span>
            <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-1 py-0.2 rounded font-semibold">GDPR/CCPA</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>CRM Sync:</span>
            <span className="text-sky-400 font-mono font-medium">{syncRate}%</span>
          </div>

          {/* Quick Action Buttons */}
          <button
            onClick={onRunAutonomousCycle}
            disabled={isCycling}
            id="btn-run-autonomous-cycle"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-md transition-all ${
              isCycling
                ? 'bg-indigo-700/50 cursor-not-allowed text-indigo-200'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-95'
            }`}
          >
            {isCycling ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Ejecutando IA...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Ejecutar Ciclo Autónomo</span>
              </>
            )}
          </button>

          {/* Export dropdown / buttons */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={onExportExcel}
              id="btn-export-excel-nav"
              title="Exportar métricas a Excel (.xlsx)"
              className="px-2 py-1 text-xs text-slate-300 hover:text-emerald-400 hover:bg-slate-800/80 rounded transition flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline font-mono">Excel</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={onExportPdf}
              id="btn-export-pdf-nav"
              title="Exportar reporte a PDF (.pdf)"
              className="px-2 py-1 text-xs text-slate-300 hover:text-rose-400 hover:bg-slate-800/80 rounded transition flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline font-mono">PDF</span>
            </button>
          </div>

          <button
            onClick={onOpenAgentSettings || onOpenConfig}
            id="btn-agent-config"
            title="Configurar Parámetros del Agente de Ventas"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap flex items-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
