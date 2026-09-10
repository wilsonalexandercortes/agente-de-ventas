import React, { useState, useEffect } from 'react';
import { X, Sliders, Bot, ShieldCheck, CheckCircle2, Percent, Target, Clock, MessageSquare } from 'lucide-react';
import { AgentConfig, AutonomyLevel, AgentTone } from '../types.ts';

interface AgentConfigModalProps {
  config: AgentConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: Partial<AgentConfig>) => Promise<void>;
}

export const AgentConfigModal: React.FC<AgentConfigModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<AgentConfig>(config);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configuración del Agente Autónomo</h3>
              <p className="text-xs text-slate-400">Personaliza el comportamiento, margen y políticas de cierre.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Autonomy Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Nivel de Autonomía de Negociación:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'full', title: 'Completamente Autónomo', desc: 'Negocia, contraoferta y cierra sin fricción' },
                { id: 'semi', title: 'Semi-Autónomo', desc: 'IA redacta; humano valida en 1 clic' },
                { id: 'supervised', title: 'Supervisado', desc: 'Revisión obligatoria antes de enviar' },
              ].map(lvl => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, autonomyLevel: lvl.id as AutonomyLevel })}
                  className={`p-3 rounded-xl text-left border transition text-xs flex flex-col justify-between ${
                    formData.autonomyLevel === lvl.id
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold text-white block mb-1">{lvl.title}</span>
                  <span className="text-[11px] leading-tight">{lvl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Discount & Margin Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Descuento Máximo Autorizado:</span>
                <span className="font-mono font-bold text-amber-400">{formData.maxDiscountPercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={1}
                value={formData.maxDiscountPercent}
                onChange={e => setFormData({ ...formData, maxDiscountPercent: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
              <span className="text-[10px] text-slate-400 block">
                La IA no ofrecerá concesiones mayores a este límite bajo ninguna circunstancia.
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Margen Comercial Objetivo:</span>
                <span className="font-mono font-bold text-emerald-400">{formData.targetMargin}%</span>
              </div>
              <input
                type="range"
                min={15}
                max={60}
                step={1}
                value={formData.targetMargin}
                onChange={e => setFormData({ ...formData, targetMargin: Number(e.target.value) })}
                className="w-full accent-emerald-500"
              />
              <span className="text-[10px] text-slate-400 block">
                Umbral mínimo de rentabilidad protegido en cada cotización.
              </span>
            </div>
          </div>

          {/* Tone & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tono del Agente:</label>
              <select
                value={formData.tone}
                onChange={e => setFormData({ ...formData, tone: e.target.value as AgentTone })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="consultative">Consultivo & Asesor B2B</option>
                <option value="assertive">Asertivo & Orientado a Cierre</option>
                <option value="friendly">Cálido, Cercano & Empático</option>
                <option value="enterprise_b2b">Corporativo Enterprise Formal</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Cadencia de Seguimiento Automático:</label>
              <select
                value={formData.autoFollowUpHours}
                onChange={e => setFormData({ ...formData, autoFollowUpHours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value={2}>Cada 2 horas si hay objeción activa</option>
                <option value={4}>Cada 4 horas (Recomendado)</option>
                <option value={8}>Cada 8 horas en horario laboral</option>
                <option value={24}>Una vez al día (Modo conservador)</option>
              </select>
            </div>
          </div>

          {/* Prompt Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Instrucción del Sistema (System Prompt) de Negociación:
            </label>
            <textarea
              value={formData.activePromptTemplate}
              onChange={e => setFormData({ ...formData, activePromptTemplate: e.target.value })}
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* CRM & E2E Toggles */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white">Sincronización Automática Continua con CRM</span>
              <p className="text-[11px] text-slate-400">Actualizar HubSpot/Salesforce en cada avance de etapa.</p>
            </div>
            <input
              type="checkbox"
              checked={formData.crmAutoSyncEnabled}
              onChange={e => setFormData({ ...formData, crmAutoSyncEnabled: e.target.checked })}
              className="w-4 h-4 accent-indigo-500"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              id="btn-save-agent-config"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
            >
              {isSaving ? 'Guardando...' : 'Guardar Parámetros'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
