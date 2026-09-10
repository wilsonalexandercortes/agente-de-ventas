import { Lead, AgentConfig, CRMProviderConfig, AuditLog, SalesReport, SystemUsageMetrics, LeadStage } from '../types.ts';

export interface AppState {
  leads: Lead[];
  agentConfig: AgentConfig;
  crmProviders: CRMProviderConfig[];
  auditLogs: AuditLog[];
  reports: SalesReport[];
  liveFeed: { id: string; time: string; text: string; type: 'success' | 'ai' | 'sync' | 'shield' }[];
  metrics: SystemUsageMetrics;
}

export async function fetchAppState(): Promise<AppState> {
  const res = await fetch('/api/state');
  if (!res.ok) throw new Error('Error al cargar el estado del agente de ventas');
  return res.json();
}

export async function createLead(leadData: Partial<Lead>): Promise<Lead> {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData),
  });
  if (!res.ok) throw new Error('Error al guardar el prospecto');
  const data = await res.json();
  return data.lead;
}

export async function updateLeadStage(leadId: string, stage: LeadStage): Promise<Lead> {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: leadId, stage }),
  });
  if (!res.ok) throw new Error('Error al actualizar la etapa del prospecto');
  const data = await res.json();
  return data.lead;
}

export async function sendAgentMessage(leadId: string, userMessage: string): Promise<{
  lead: Lead;
  agentMessage: {
    id: string;
    sender: 'agent';
    content: string;
    timestamp: string;
    intent?: string;
    discountOffered?: number;
    encrypted: boolean;
  };
  metrics: SystemUsageMetrics;
  liveFeed: any[];
}> {
  const res = await fetch('/api/agent/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId, userMessage }),
  });
  if (!res.ok) throw new Error('Error al procesar la negociación con IA');
  return res.json();
}

export async function runAutonomousCycle(): Promise<{
  success: boolean;
  updatesCount: number;
  actions: string[];
  leads: Lead[];
  metrics: SystemUsageMetrics;
}> {
  const res = await fetch('/api/agent/autonomous-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Error al ejecutar el ciclo autónomo');
  const data = await res.json();
  return {
    success: data.success,
    updatesCount: data.actionsTaken?.length || 0,
    actions: data.actionsTaken || [],
    leads: data.leads,
    metrics: data.metrics,
  };
}

export async function customizeMessage(payload: {
  leadId?: string;
  template?: string;
  tone: string;
  channel: string;
  customGoal: string;
}): Promise<{ message: string; variablesUsed: any }> {
  const res = await fetch('/api/agent/customize-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al personalizar el mensaje con el modelo de lenguaje');
  return res.json();
}

export async function generateAutomatedReport(period: string): Promise<SalesReport> {
  const res = await fetch('/api/agent/generate-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ period }),
  });
  if (!res.ok) throw new Error('Error al generar el reporte automatizado');
  const data = await res.json();
  return data.report;
}

export async function syncCrmData(providerId?: string): Promise<{
  success: boolean;
  syncedLeads: number;
  crmProviders: CRMProviderConfig[];
  leads: Lead[];
  auditLogs: AuditLog[];
}> {
  const res = await fetch('/api/crm/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerId }),
  });
  if (!res.ok) throw new Error('Error al sincronizar con el CRM');
  const data = await res.json();
  return {
    success: data.success,
    syncedLeads: data.leads?.length || 0,
    crmProviders: data.crmProviders,
    leads: data.leads,
    auditLogs: data.auditLogs,
  };
}

export async function updateAgentConfig(config: Partial<AgentConfig>): Promise<AgentConfig> {
  const res = await fetch('/api/agent/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Error al actualizar la configuración del agente');
  const data = await res.json();
  return data.agentConfig;
}
