import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Sparkles,
  RefreshCw,
  Lock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  Building,
  Mail,
  Phone,
  Layers,
  Table as TableIcon,
  Kanban,
} from 'lucide-react';
import { Lead, LeadStage } from '../types.ts';

interface LeadsPipelineViewProps {
  leads: Lead[];
  onOpenNegotiationModal: (lead: Lead) => void;
  onOpenCustomizerForLead: (lead: Lead) => void;
  onAddNewLead: () => void;
  onSyncCrmLead: (lead: Lead) => void;
}

export const LeadsPipelineView: React.FC<LeadsPipelineViewProps> = ({
  leads,
  onOpenNegotiationModal,
  onOpenCustomizerForLead,
  onAddNewLead,
  onSyncCrmLead,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const stageColumns: { id: LeadStage; title: string; badgeColor: string }[] = [
    { id: 'prospecting', title: 'Prospección', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'qualification', title: 'Calificación', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { id: 'negotiation', title: 'Negociación Activa', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { id: 'closing', title: 'Cierre Pendiente', badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { id: 'won', title: 'Ganada (Cerrada)', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  ];

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = selectedStage === 'all' || lead.stage === selectedStage;

    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Gestión de Clientes Potenciales & Pipeline
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {filteredLeads.length} de {leads.length} activos
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Negociación autónoma, calificación de requerimientos y sincronización centralizada en CRM.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por contacto, empresa o email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-56 sm:w-64"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vista Tablero Kanban"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vista Tabla Detallada"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Add New Lead Button */}
          <button
            onClick={onAddNewLead}
            id="btn-add-new-lead"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Prospecto</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Mode */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stageColumns.map(column => {
            const columnLeads = filteredLeads.filter(l => l.stage === column.id);
            const columnTotal = columnLeads.reduce((acc, l) => acc + l.dealValue, 0);

            return (
              <div
                key={column.id}
                className="flex flex-col rounded-2xl bg-slate-900/50 border border-slate-800/80 p-3.5 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{column.title}</h3>
                    <p className="text-[11px] font-mono text-indigo-300 mt-0.5">${columnTotal.toLocaleString()} USD</p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${column.badgeColor}`}>
                    {columnLeads.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 pt-3 flex-1 overflow-y-auto pr-0.5">
                  {columnLeads.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-800/80 rounded-xl">
                      Sin prospectos en esta etapa
                    </div>
                  ) : (
                    columnLeads.map(lead => (
                      <div
                        key={lead.id}
                        className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-indigo-500/40 transition-all shadow-sm space-y-2.5 group"
                      >
                        {/* Company & Priority */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 truncate max-w-[130px]">
                            <Building className="w-3 h-3 text-slate-400" />
                            {lead.company}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                              lead.priority === 'high'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {lead.priority.toUpperCase()}
                          </span>
                        </div>

                        {/* Contact Name & Role */}
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                            {lead.name}
                          </h4>
                          <p className="text-[11px] text-slate-400">{lead.role}</p>
                        </div>

                        {/* Value & Probability */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 font-mono text-xs">
                          <span className="font-extrabold text-white">
                            ${lead.dealValue.toLocaleString()}{' '}
                            <span className="text-[10px] text-slate-400 font-normal">USD</span>
                          </span>
                          <span className="text-emerald-400 font-semibold">{lead.probability}% Prob</span>
                        </div>

                        {/* Objections Tag */}
                        {lead.objections.length > 0 && (
                          <div className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-1 rounded-md line-clamp-1">
                            ⚠️ {lead.objections[0]}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenNegotiationModal(lead)}
                            id={`card-negotiate-${lead.id}`}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-semibold border border-indigo-500/30 transition flex items-center justify-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Negociar IA</span>
                          </button>
                          <button
                            onClick={() => onOpenCustomizerForLead(lead)}
                            title="Personalizar mensaje con LLM"
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onSyncCrmLead(lead)}
                            title={`Sincronizar con ${lead.crmProvider}`}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-sky-400 border border-slate-800 transition"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Mode */}
      {viewMode === 'table' && (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Contacto / Empresa</th>
                  <th className="px-4 py-3">Etapa</th>
                  <th className="px-4 py-3">Valor de Negocio</th>
                  <th className="px-4 py-3">Probabilidad</th>
                  <th className="px-4 py-3">Canal</th>
                  <th className="px-4 py-3">CRM Sync</th>
                  <th className="px-4 py-3">Cifrado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white text-sm">{lead.name}</div>
                      <div className="text-slate-400 text-xs">
                        {lead.company} • {lead.role}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-200 border border-slate-700">
                        {lead.stage.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-white">
                      ${lead.dealValue.toLocaleString()} USD
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-emerald-400">
                      {lead.probability}%
                    </td>
                    <td className="px-4 py-3 text-slate-300">{lead.channel}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          lead.crmSyncStatus === 'synced'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {lead.crmProvider}: {lead.crmSyncStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        AES-256
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onOpenNegotiationModal(lead)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium border border-indigo-500/30 transition inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Negociar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
