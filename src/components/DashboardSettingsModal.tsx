import React from 'react';
import { X, Settings2, Check, LayoutGrid, Sliders } from 'lucide-react';
import { DashboardWidgetConfig } from '../types.ts';

interface DashboardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DashboardWidgetConfig;
  onUpdateConfig: (newConfig: DashboardWidgetConfig) => void;
}

export const DashboardSettingsModal: React.FC<DashboardSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  if (!isOpen) return null;

  const toggleWidget = (key: keyof DashboardWidgetConfig) => {
    onUpdateConfig({
      ...config,
      [key]: !config[key],
    });
  };

  const widgetOptions: { key: keyof DashboardWidgetConfig; label: string; desc: string }[] = [
    { key: 'showKpis', label: 'Tarjetas de Métricas Clave (KPIs)', desc: 'Pipeline total, ingresos ganados, efectividad y velocidad' },
    { key: 'showFunnel', label: 'Embudo de Conversión por Etapas', desc: 'Visualización gráfica de avance desde prospección a cierre' },
    { key: 'showLiveAgentActivity', label: 'Feed en Vivo del Agente', desc: 'Acciones de contraoferta y auditorías en tiempo real' },
    { key: 'showChannelPerformance', label: 'Rendimiento por Canal (Email, WhatsApp, etc.)', desc: 'Desglose de conversión según medio de contacto' },
    { key: 'showObjectionCloud', label: 'Top Objeciones Neutralizadas', desc: 'Frecuencia de objeciones resueltas por el modelo de IA' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configuración del Panel de Usuario</h3>
              <p className="text-xs text-slate-400">Personaliza los módulos y widgets visibles en tu pantalla principal.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-6 space-y-3 overflow-y-auto">
          {widgetOptions.map(opt => {
            const isEnabled = !!config[opt.key];
            return (
              <div
                key={opt.key}
                onClick={() => toggleWidget(opt.key)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isEnabled
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-slate-100'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">{opt.label}</h4>
                  <p className="text-[11px] text-slate-400">{opt.desc}</p>
                </div>

                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                    isEnabled ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {isEnabled && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            Listo, Aplicar al Panel
          </button>
        </div>
      </div>
    </div>
  );
};
