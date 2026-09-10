import React, { useState } from 'react';
import { X, UserPlus, Building, Mail, Phone, DollarSign, Layers } from 'lucide-react';
import { Lead, LeadStage, PriorityLevel, ChannelType } from '../types.ts';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLead: (leadData: Partial<Lead>) => Promise<void>;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  onSaveLead,
}) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dealValue, setDealValue] = useState(35000);
  const [stage, setStage] = useState<LeadStage>('qualification');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [channel, setChannel] = useState<ChannelType>('Email');
  const [objections, setObjections] = useState('');
  const [notes, setNotes] = useState('');
  const [crmProvider, setCrmProvider] = useState<'HubSpot' | 'Salesforce' | 'Zoho' | 'Pipedrive'>('HubSpot');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveLead({
        name,
        company,
        role: role || 'Tomador de Decisión',
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: phone || '+52 55 0000 0000',
        dealValue: Number(dealValue),
        stage,
        priority,
        channel,
        objections: objections ? objections.split(',').map(o => o.trim()) : [],
        notes,
        crmProvider,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Registrar Nuevo Prospecto</h3>
              <p className="text-xs text-slate-400">Ingreso de oportunidad para prospección o negociación autónoma.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Nombre del Contacto *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Sofia Morales"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Empresa / Organización *</label>
              <input
                type="text"
                required
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Ej: Nova Retail S.A."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Cargo</label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="Ej: Directora Comercial"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Corporativo</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Teléfono / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+52 ..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Valor Estimado (USD)</label>
              <input
                type="number"
                value={dealValue}
                onChange={e => setDealValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Etapa Inicial</label>
              <select
                value={stage}
                onChange={e => setStage(e.target.value as LeadStage)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="prospecting">Prospección</option>
                <option value="qualification">Calificación</option>
                <option value="negotiation">Negociación Activa</option>
                <option value="closing">Cierre Pendiente</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Canal de Contacto</label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value as ChannelType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="Email">Email</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="WebChat">WebChat</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Proveedor CRM Destino</label>
              <select
                value={crmProvider}
                onChange={e => setCrmProvider(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="HubSpot">HubSpot CRM</option>
                <option value="Salesforce">Salesforce Cloud</option>
                <option value="Pipedrive">Pipedrive</option>
                <option value="Zoho">Zoho CRM</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Objeciones Conocidas (Separadas por comas)</label>
              <input
                type="text"
                value={objections}
                onChange={e => setObjections(e.target.value)}
                placeholder="Presupuesto, Tiempos, Integración..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Notas / Requerimientos Especiales</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Detalles sobre infraestructura, expectativas o competidores evaluados..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-submit-new-lead"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar & Activar Agente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
