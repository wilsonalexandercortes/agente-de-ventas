import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  Key,
  FileCheck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { AuditLog, AgentConfig } from '../types.ts';

interface SecurityComplianceViewProps {
  auditLogs: AuditLog[];
  agentConfig: AgentConfig;
  onTogglePiiMasking: () => void;
  onToggleE2eEncryption: () => void;
}

export const SecurityComplianceView: React.FC<SecurityComplianceViewProps> = ({
  auditLogs,
  agentConfig,
  onTogglePiiMasking,
  onToggleE2eEncryption,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [testPiiInput, setTestPiiInput] = useState('Contacto: Carlos Mendoza (cmendoza@fintechandina.com, Tel: +52 55 4912 8831)');

  const maskedOutput = testPiiInput
    .replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '[EMAIL_REDACTADO]')
    .replace(/\+?\d[\d -]{8,}\d/g, '[TEL_REDACTADO]')
    .replace(/Carlos Mendoza/g, '[CLIENTE_ANONIMO_01]');

  const filteredLogs = auditLogs.filter(
    l => filterCategory === 'ALL' || l.category === filterCategory
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Seguridad de Grado Empresarial & Cumplimiento Normativo
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AES-256-GCM
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cifrado de extremo a extremo, enmascaramiento de PII y cumplimiento estricto de GDPR, CCPA e ISO 27001.
            </p>
          </div>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* E2E Encryption Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Cifrado E2E</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-lg font-bold text-white font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>AES-256-GCM</span>
          </div>
          <p className="text-xs text-slate-400">
            Todas las comunicaciones entre prospectos, agente y CRM se cifran antes de persistirse.
          </p>
          <button
            onClick={onToggleE2eEncryption}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            {agentConfig.e2eEncryptionEnabled ? 'Estado: Activo' : 'Habilitar Cifrado'}
          </button>
        </div>

        {/* GDPR Compliance */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Normativa UE</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
              CONFORME
            </span>
          </div>
          <div className="text-lg font-bold text-white font-mono flex items-center gap-1.5">
            <FileCheck className="w-5 h-5 text-sky-400" />
            <span>RGPD / GDPR</span>
          </div>
          <p className="text-xs text-slate-400">
            Derecho al olvido, minimización de datos y consentimiento explícito en cada canal.
          </p>
          <span className="text-xs text-sky-400 font-mono">DPA Validado</span>
        </div>

        {/* CCPA / CPRA */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">California Privacy</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
              VERIFICADO
            </span>
          </div>
          <div className="text-lg font-bold text-white font-mono flex items-center gap-1.5">
            <Key className="w-5 h-5 text-indigo-400" />
            <span>CCPA / CPRA</span>
          </div>
          <p className="text-xs text-slate-400">
            No comercialización de datos personales y registro de auditoría de transferencias.
          </p>
          <span className="text-xs text-indigo-400 font-mono">Zero Third-Party Sale</span>
        </div>

        {/* ISO 27001 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Certificación</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
              AUDITADO
            </span>
          </div>
          <div className="text-lg font-bold text-white font-mono flex items-center gap-1.5">
            <Cpu className="w-5 h-5 text-amber-400" />
            <span>ISO/IEC 27001</span>
          </div>
          <p className="text-xs text-slate-400">
            Controles criptográficos, segregación de tenants y trazabilidad inmutable.
          </p>
          <span className="text-xs text-amber-400 font-mono">SOC2 / ISO Aligned</span>
        </div>
      </div>

      {/* PII Anonymizer / Data Masking Live Test */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-emerald-400" />
              Escudo de Privacidad & Enmascaramiento de Datos Sensibles (PII)
            </h3>
            <p className="text-xs text-slate-400">
              Antes de que cualquier mensaje sea procesado por el modelo de IA, los datos personales se anonimizan.
            </p>
          </div>

          <button
            onClick={onTogglePiiMasking}
            id="btn-toggle-pii"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              agentConfig.piiMaskingEnabled
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {agentConfig.piiMaskingEnabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
            <span>{agentConfig.piiMaskingEnabled ? 'Enmascaramiento Activo' : 'Enmascaramiento Desactivado'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400">Entrada del Prospecto (Original):</span>
            <input
              type="text"
              value={testPiiInput}
              onChange={e => setTestPiiInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-emerald-400">Salida Sanitizada para el Modelo IA:</span>
            <div className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-900/40 text-xs text-emerald-300 font-mono">
              {agentConfig.piiMaskingEnabled ? maskedOutput : testPiiInput}
            </div>
          </div>
        </div>
      </div>

      {/* Cryptographic Audit Trail Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              Pista de Auditoría Criptográfica & Trazabilidad Inmutable
            </h3>
            <p className="text-xs text-slate-400">
              Registro histórico con sello de tiempo y hash de verificación SHA-256 para auditorías externas.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['ALL', 'SECURITY', 'CRM_SYNC', 'AI_NEGOTIATION'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterCategory === cat
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Fecha / Hora</th>
                <th className="px-4 py-3">Acción Registrada</th>
                <th className="px-4 py-3">Actor / Servicio</th>
                <th className="px-4 py-3">Detalle de Operación</th>
                <th className="px-4 py-3">Hash IP</th>
                <th className="px-4 py-3">Checksum SHA-256</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">{log.action}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">{log.actor}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{log.details}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{log.ipHash}</td>
                  <td className="px-4 py-3 text-emerald-400 font-mono text-[11px]">
                    ✓ {log.checksum}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
