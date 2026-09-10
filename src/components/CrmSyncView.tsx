import React, { useState } from 'react';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Clock,
  Layers,
  ExternalLink,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { CRMProviderConfig, AuditLog, Lead } from '../types.ts';

interface CrmSyncViewProps {
  crmProviders: CRMProviderConfig[];
  leads: Lead[];
  auditLogs: AuditLog[];
  onTriggerSync: (providerId?: string) => Promise<void>;
  isSyncing: boolean;
}

export const CrmSyncView: React.FC<CrmSyncViewProps> = ({
  crmProviders,
  leads,
  auditLogs,
  onTriggerSync,
  isSyncing,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const crmAuditLogs = auditLogs.filter(a => a.category === 'CRM_SYNC');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Sincronización Automática con Sistemas CRM
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Bidireccional Activa
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Integración centralizada con HubSpot, Salesforce, Zoho y Pipedrive con cifrado de extremo a extremo.
            </p>
          </div>
        </div>

        <button
          onClick={() => onTriggerSync()}
          disabled={isSyncing}
          id="btn-sync-all-crm"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Todos los CRM Ahora'}</span>
        </button>
      </div>

      {/* CRM Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {crmProviders.map(provider => (
          <div
            key={provider.id}
            className={`p-5 rounded-2xl bg-slate-900/80 border transition-all flex flex-col justify-between space-y-4 ${
              provider.connected
                ? 'border-slate-800 hover:border-sky-500/40'
                : 'border-slate-800/40 opacity-70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    provider.connected
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {provider.connected ? 'CONECTADO' : 'DESCONECTADO'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{provider.apiKeyMasked}</span>
              </div>

              <h3 className="text-base font-bold text-white mt-2">{provider.name}</h3>

              <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Registros sincronizados:</span>
                  <span className="font-mono font-bold text-white">{provider.syncedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Última sincronización:</span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    {new Date(provider.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Events list */}
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Disparadores Automáticos:
                </span>
                <div className="flex flex-wrap gap-1">
                  {provider.autoSyncEvents.map(ev => (
                    <span
                      key={ev}
                      className="text-[10px] font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300"
                    >
                      {ev}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onTriggerSync(provider.id)}
              disabled={isSyncing || !provider.connected}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-sky-400 hover:text-sky-300 text-xs font-semibold border border-slate-800 transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Forzar Sincronización</span>
            </button>
          </div>
        ))}
      </div>

      {/* Central Data Synchronization State Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Estado de Sincronización Centralizada por Prospecto
            </h3>
            <p className="text-xs text-slate-400">
              Garantiza que todos los miembros del equipo y sistemas CRM mantengan la misma versión de la verdad.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            {leads.filter(l => l.crmSyncStatus === 'synced').length} de {leads.length} sincronizados
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-2.5">Prospecto / Empresa</th>
                <th className="px-4 py-2.5">Proveedor CRM</th>
                <th className="px-4 py-2.5">ID Externo</th>
                <th className="px-4 py-2.5">Etapa Actual</th>
                <th className="px-4 py-2.5">Valor del Negocio</th>
                <th className="px-4 py-2.5">Estado</th>
                <th className="px-4 py-2.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-2.5 font-medium text-white">
                    {lead.name} <span className="text-slate-400 font-normal">({lead.company})</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-300 font-mono">{lead.crmProvider}</td>
                  <td className="px-4 py-2.5 text-slate-400 font-mono text-[11px]">{lead.crmId}</td>
                  <td className="px-4 py-2.5 uppercase text-slate-300 text-[11px] font-mono">{lead.stage}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-white">${lead.dealValue.toLocaleString()} USD</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        lead.crmSyncStatus === 'synced'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {lead.crmSyncStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => onTriggerSync()}
                      className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                    >
                      Re-sincronizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Audit Trail */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Registro Histórico de Auditoría de Sincronización
        </h3>

        <div className="space-y-2">
          {crmAuditLogs.slice(0, 5).map(log => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{log.action}</span>
                  <span className="text-[10px] font-mono text-slate-400">{log.actor}</span>
                </div>
                <p className="text-slate-400 mt-0.5 text-xs">{log.details}</p>
              </div>

              <div className="flex items-center gap-3 text-right font-mono text-[11px] text-slate-500">
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="text-emerald-500">SHA-256: {log.checksum}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
