import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  MessageSquareCode,
  Building,
  User,
  CheckCircle2,
  Mail,
  Linkedin,
  Phone,
} from 'lucide-react';
import { Lead, AgentTone } from '../types.ts';
import { customizeMessage } from '../services/api.ts';

interface MessageCustomizerProps {
  leads: Lead[];
  selectedLeadId?: string;
  onSendCustomizedMessageToLead?: (leadId: string, messageText: string) => void;
}

export const MessageCustomizerModal: React.FC<MessageCustomizerProps> = ({
  leads,
  selectedLeadId,
  onSendCustomizedMessageToLead,
}) => {
  const [leadId, setLeadId] = useState<string>(selectedLeadId || (leads[0]?.id ?? ''));
  const [tone, setTone] = useState<AgentTone>('consultative');
  const [channel, setChannel] = useState<'Email' | 'WhatsApp' | 'LinkedIn' | 'WebChat'>('Email');
  const [goal, setGoal] = useState('Reactivar negociación destacando ROI y soporte dedicado');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const selectedLead = leads.find(l => l.id === leadId) || leads[0];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSentSuccess(false);
    try {
      const res = await customizeMessage({
        leadId: selectedLead?.id,
        tone,
        channel,
        customGoal: goal,
      });
      setGeneratedMessage(res.message);
    } catch (err) {
      console.error('Error customizing message:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToLead = () => {
    if (!generatedMessage || !selectedLead || !onSendCustomizedMessageToLead) return;
    onSendCustomizedMessageToLead(selectedLead.id, generatedMessage);
    setSentSuccess(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <MessageSquareCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Personalización de Mensajes con Modelos de Lenguaje Avanzados
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Genera comunicaciones comerciales hiperpersonalizadas y contextualmente adaptadas con Gemini AI.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Configuration Panel */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Parámetros del Prospecto & Contexto
          </h3>

          {/* Lead Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Seleccionar Prospecto de la Cartera:</label>
            <select
              value={leadId}
              onChange={e => setLeadId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} — {l.company} (${l.dealValue.toLocaleString()} USD)
                </option>
              ))}
            </select>
          </div>

          {/* Lead Snapshot Pill */}
          {selectedLead && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold">{selectedLead.role}</span>
                <span className="font-mono text-emerald-400">{selectedLead.probability}% Probabilidad</span>
              </div>
              <div className="text-slate-400">
                Objeciones:{' '}
                <strong className="text-amber-300">
                  {selectedLead.objections.join(', ') || 'Ninguna registrada'}
                </strong>
              </div>
            </div>
          )}

          {/* Tone Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Tono de la Comunicación:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'consultative', label: 'Consultivo & Asesor' },
                { id: 'assertive', label: 'Asertivo / Cierre Rápido' },
                { id: 'friendly', label: 'Cálido & Empático' },
                { id: 'enterprise_b2b', label: 'Corporativo B2B' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id as AgentTone)}
                  className={`p-2 rounded-xl text-xs font-medium text-left border transition ${
                    tone === t.id
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Channel Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Canal de Envío:</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'Email', icon: Mail },
                { id: 'LinkedIn', icon: Linkedin },
                { id: 'WhatsApp', icon: Phone },
                { id: 'WebChat', icon: Send },
              ].map(ch => {
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id as any)}
                    className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 border transition ${
                      channel === ch.id
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{ch.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Goal Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Objetivo Específico del Mensaje:</label>
            <input
              type="text"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="Ej: Desbloquear objeción de costo con descuento trimestral..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            id="btn-generate-custom-msg"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generando con Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generar Mensaje Personalizado con IA</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Output Preview Panel */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Vista Previa del Mensaje
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Canal: {channel}
                </span>
              </div>

              {generatedMessage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    id="btn-copy-custom-msg"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content text area */}
            <div className="mt-4">
              {generatedMessage ? (
                <textarea
                  value={generatedMessage}
                  onChange={e => setGeneratedMessage(e.target.value)}
                  rows={14}
                  className="w-full p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-100 text-sm font-sans leading-relaxed focus:outline-none focus:border-indigo-500 resize-none font-normal"
                />
              ) : (
                <div className="py-24 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  Configura los parámetros a la izquierda y presiona <strong>"Generar Mensaje con IA"</strong> para
                  obtener una propuesta adaptada a este prospecto.
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          {generatedMessage && (
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Variables aplicadas: {selectedLead?.name} ({selectedLead?.company})
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendToLead}
                  disabled={sentSuccess}
                  id="btn-send-to-lead"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  {sentSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mensaje Enviado & Sincronizado</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar al Historial del Lead</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
