import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  TrendingUp,
  Percent,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  Building,
  RefreshCw,
  Award,
} from 'lucide-react';
import { Lead, MessageItem } from '../types.ts';

interface LeadNegotiationModalProps {
  lead: Lead | null;
  onClose: () => void;
  onSendMessage: (leadId: string, messageText: string) => Promise<void>;
  onMarkDealWon: (lead: Lead) => void;
  isProcessing: boolean;
}

export const LeadNegotiationModal: React.FC<LeadNegotiationModalProps> = ({
  lead,
  onClose,
  onSendMessage,
  onMarkDealWon,
  isProcessing,
}) => {
  const [inputText, setInputText] = useState('');
  const [contractGenerated, setContractGenerated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lead?.messages, isProcessing]);

  if (!lead) return null;

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(lead.id, text);
  };

  const quickObjections = [
    'El costo supera nuestro presupuesto asignado para este semestre',
    '¿Qué garantías de disponibilidad (SLA) y cumplimiento RGPD ofrecen?',
    '¿Tienen posibilidad de ofrecer un 10% de descuento por pago anual?',
    'Aprobado internamente. Por favor emitan el contrato oficial para firma.',
  ];

  const handleEmitContract = () => {
    setContractGenerated(true);
    onMarkDealWon(lead);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[85vh] max-h-[850px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{lead.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  {lead.company}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  E2E Encrypted
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lead.role} • Canal: <strong className="text-slate-200">{lead.channel}</strong> • CRM:{' '}
                <strong className="text-sky-400">{lead.crmProvider} (#{lead.crmId})</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400">Valor Actual: </span>
              <span className="font-mono font-bold text-white text-sm">
                ${lead.dealValue.toLocaleString()} {lead.currency}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400">Probabilidad: </span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{lead.probability}%</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400">Etapa: </span>
              <span className="uppercase font-mono font-semibold text-indigo-400">{lead.stage}</span>
            </div>
          </div>

          {lead.stage !== 'won' ? (
            <button
              onClick={handleEmitContract}
              id="btn-emit-contract"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Emitir Contrato & Cerrar Trato</span>
            </button>
          ) : (
            <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs">
              <Award className="w-3.5 h-3.5" /> Trato Ganado & Contrato Emitido
            </span>
          )}
        </div>

        {/* Chat History Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/20">
          {lead.messages.map(msg => {
            const isAgent = msg.sender === 'agent';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isAgent ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isAgent
                      ? 'bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isAgent
                        ? 'bg-indigo-600/15 border border-indigo-500/30 text-slate-100 rounded-tr-none'
                        : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {msg.discountOffered && (
                      <div className="mt-2 pt-2 border-t border-indigo-500/20 flex items-center gap-1 text-xs font-mono text-emerald-400">
                        <Percent className="w-3 h-3" />
                        <span>Descuento Estratégico Aplicado: {msg.discountOffered}%</span>
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex items-center gap-2 text-[10px] font-mono text-slate-400 px-1 ${
                      isAgent ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.intent && (
                      <span className="text-indigo-400 font-semibold bg-indigo-500/10 px-1.5 py-0.2 rounded">
                        {msg.intent}
                      </span>
                    )}
                    <span className="text-slate-400">AES-256</span>
                  </div>
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>El Agente de Ventas IA está evaluando la contraoferta y margen...</span>
            </div>
          )}

          {contractGenerated && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ¡Contrato Maestro de Prestación de Servicios Emitido con Éxito!
              </div>
              <p>
                El contrato ha sido sellado con firma biométrica SHA-256 por el valor final de $
                {lead.dealValue.toLocaleString()} {lead.currency} y sincronizado automáticamente con {lead.crmProvider}.
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Objection Chips */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Respuestas Rápidas:
          </span>
          {quickObjections.map((obj, i) => (
            <button
              key={i}
              onClick={() => setInputText(obj)}
              className="text-[11px] whitespace-nowrap bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 transition"
            >
              {obj}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Escribe la postura o contrapropuesta del prospecto..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              id="btn-send-negotiation-msg"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Responder con IA</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
