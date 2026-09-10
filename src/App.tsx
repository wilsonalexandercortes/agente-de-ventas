/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { LeadsPipelineView } from './components/LeadsPipelineView.tsx';
import { MessageCustomizerModal } from './components/MessageCustomizerModal.tsx';
import { CrmSyncView } from './components/CrmSyncView.tsx';
import { AutomatedReportsView } from './components/AutomatedReportsView.tsx';
import { SecurityComplianceView } from './components/SecurityComplianceView.tsx';
import { LeadNegotiationModal } from './components/LeadNegotiationModal.tsx';
import { AgentConfigModal } from './components/AgentConfigModal.tsx';
import { DashboardSettingsModal } from './components/DashboardSettingsModal.tsx';
import { NewLeadModal } from './components/NewLeadModal.tsx';

import {
  fetchAppState,
  runAutonomousCycle,
  sendAgentMessage,
  syncCrmData,
  generateAutomatedReport,
  updateAgentConfig,
  createLead,
  updateLeadStage,
} from './services/api.ts';
import { exportPipelineToExcel, exportPipelineToPdf } from './services/exportService.ts';

import {
  Lead,
  AgentConfig,
  CRMProviderConfig,
  SystemUsageMetrics,
  AuditLog,
  SalesReport,
  DashboardWidgetConfig,
  LeadStage,
} from './types.ts';

const DEFAULT_AGENT_CONFIG: AgentConfig = {
  name: 'Nexus-SalesAI v4.2',
  autonomyLevel: 'full',
  maxDiscountPercent: 18,
  targetMargin: 35,
  tone: 'consultative',
  language: 'Español',
  personaDescription: 'Especialista Senior en Negociación B2B y Cierre Autónomo con enfoque consultivo de valor, manejo empático de objeciones y cierres acelerados.',
  activePromptTemplate: 'Eres un Agente Autónomo de Negociación B2B para {{company}}. Analiza las objeciones de {{lead_name}}, evalúa el presupuesto de {{budget}}, resalta el ROI diferencial y formula una propuesta irresistible con un llamado a la acción concreto para formalizar el acuerdo hoy mismo.',
  autoFollowUpHours: 4,
  crmAutoSyncEnabled: true,
  e2eEncryptionEnabled: true,
  piiMaskingEnabled: true,
  privacyCompliance: 'GDPR',
};

const DEFAULT_METRICS: SystemUsageMetrics = {
  totalLeads: 12,
  activeNegotiations: 8,
  wonRevenue: 142000,
  pipelineValue: 384000,
  winRatePercent: 41,
  avgResponseTimeMs: 840,
  autonomousActionsCount: 64,
  aiTokensProcessed: 284920,
  crmSyncSuccessRate: 99.4,
  systemUptime: 99.98,
  e2eEncryptionVerified: true,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(DEFAULT_AGENT_CONFIG);
  const [crmProviders, setCrmProviders] = useState<CRMProviderConfig[]>([]);
  const [metrics, setMetrics] = useState<SystemUsageMetrics>(DEFAULT_METRICS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [selectedLeadForNegotiation, setSelectedLeadForNegotiation] = useState<Lead | null>(null);
  const [isAgentConfigOpen, setIsAgentConfigOpen] = useState(false);
  const [isDashboardSettingsOpen, setIsDashboardSettingsOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isCycling, setIsCycling] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Widget settings
  const [widgetConfig, setWidgetConfig] = useState<DashboardWidgetConfig>({
    showKpis: true,
    showFunnel: true,
    showRevenueChart: true,
    showLiveAgentActivity: true,
    showChannelPerformance: true,
    showObjectionCloud: true,
    showSystemMetrics: true,
    timeframe: '30d',
  });

  // Simulated live feed for activity stream
  const [liveFeed, setLiveFeed] = useState<
    { id: string; time: string; text: string; type: 'success' | 'ai' | 'sync' | 'shield' }[]
  >([
    {
      id: '1',
      time: 'Hace 1 min',
      text: 'Contrapropuesta autónoma enviada a Nova Retail S.A. con ajuste del 5% y SLA preferente.',
      type: 'ai',
    },
    {
      id: '2',
      time: 'Hace 4 min',
      text: 'Registro sincronizado en HubSpot CRM con cifrado AES-256 verificado.',
      type: 'sync',
    },
    {
      id: '3',
      time: 'Hace 8 min',
      text: 'Acuerdo cerrado con Inversiones Valparaíso por $48,000 USD. Contrato emitido.',
      type: 'success',
    },
    {
      id: '4',
      time: 'Hace 14 min',
      text: 'Verificación de consentimiento RGPD y enmascaramiento de PII ejecutado con éxito.',
      type: 'shield',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial data loading
  const loadState = async () => {
    try {
      const state = await fetchAppState();
      setLeads(state.leads || []);
      setAgentConfig(state.agentConfig);
      setCrmProviders(state.crmProviders || []);
      if (state.metrics) setMetrics(state.metrics);
      if (state.auditLogs) setAuditLogs(state.auditLogs);
      if (state.reports) setReports(state.reports);
    } catch (err) {
      console.error('Error fetching state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  // Autonomous cycle execution
  const handleRunAutonomousCycle = async () => {
    setIsCycling(true);
    try {
      const res = await runAutonomousCycle();
      showToast(`⚡ Ciclo autónomo completado: ${res.updatesCount} acciones de negociación ejecutadas.`);
      await loadState();

      // Add to feed
      setLiveFeed(prev => [
        {
          id: Date.now().toString(),
          time: 'Recién',
          text: `Ciclo autónomo ejecutado: ${res.actions?.[0] || 'Evaluación de prospectos y envío de contraofertas.'}`,
          type: 'ai',
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      console.error(err);
      showToast('Error al ejecutar el ciclo autónomo');
    } finally {
      setIsCycling(false);
    }
  };

  // CRM Sync
  const handleTriggerSync = async (providerId?: string) => {
    setIsSyncing(true);
    try {
      const res = await syncCrmData(providerId);
      showToast(`Sincronización centralizada completada: ${res.syncedLeads} tratos actualizados.`);
      await loadState();
      setLiveFeed(prev => [
        {
          id: Date.now().toString(),
          time: 'Recién',
          text: `Sincronización bidireccional completada con éxito en ${providerId || 'todos los CRM'}.`,
          type: 'sync',
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      console.error(err);
      showToast('Error en la sincronización CRM');
    } finally {
      setIsSyncing(false);
    }
  };

  // AI Chat message inside LeadNegotiationModal
  const handleSendNegotiationMessage = async (leadId: string, messageText: string) => {
    setIsChatProcessing(true);
    try {
      const response = await sendAgentMessage(leadId, messageText);
      await loadState();

      // Update active lead in modal
      setSelectedLeadForNegotiation(prev => {
        if (!prev || prev.id !== leadId) return prev;
        return response.lead;
      });

      setLiveFeed(prev => [
        {
          id: Date.now().toString(),
          time: 'Recién',
          text: `Interacción IA completada con ${selectedLeadForNegotiation?.name || 'prospecto'}.`,
          type: 'ai',
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      console.error('Error in agent message:', err);
      showToast('No se pudo procesar la respuesta con el Agente de Ventas');
    } finally {
      setIsChatProcessing(false);
    }
  };

  // Mark deal won
  const handleMarkDealWon = async (lead: Lead) => {
    try {
      await updateLeadStage(lead.id, 'won');
      await loadState();
      showToast(`🎉 ¡Trato cerrado con éxito con ${lead.name}! Contrato emitido y sincronizado.`);
      setLiveFeed(prev => [
        {
          id: Date.now().toString(),
          time: 'Recién',
          text: `¡Trato Ganado! ${lead.company} cerró por $${lead.dealValue.toLocaleString()} USD.`,
          type: 'success',
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  // Generate Report
  const handleGenerateReport = async (period: string) => {
    setIsGeneratingReport(true);
    try {
      const newRep = await generateAutomatedReport(period);
      setReports(prev => [newRep, ...prev]);
      showToast('📈 Nuevo reporte automatizado generado con éxito con IA.');
    } catch (err) {
      console.error(err);
      showToast('Error al generar el reporte');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Save Agent Config
  const handleSaveConfig = async (newConfig: Partial<AgentConfig>) => {
    try {
      const updated = await updateAgentConfig(newConfig);
      setAgentConfig(updated);
      showToast('Configuración del agente actualizada correctamente');
    } catch (err) {
      console.error(err);
    }
  };

  // Create Lead
  const handleSaveNewLead = async (leadData: Partial<Lead>) => {
    try {
      const newLead = await createLead(leadData);
      setLeads(prev => [newLead, ...prev]);
      showToast(`Prospecto ${newLead.name} creado y conectado al Agente de Ventas.`);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle PII masking
  const handleTogglePiiMasking = async () => {
    if (!agentConfig) return;
    const newVal = !agentConfig.piiMaskingEnabled;
    await handleSaveConfig({ piiMaskingEnabled: newVal });
  };

  // Toggle E2E Encryption
  const handleToggleE2eEncryption = async () => {
    if (!agentConfig) return;
    const newVal = !agentConfig.e2eEncryptionEnabled;
    await handleSaveConfig({ e2eEncryptionEnabled: newVal });
  };

  // Send message customized with LLM directly to lead
  const handleSendCustomizedToLead = async (leadId: string, messageText: string) => {
    await handleSendNegotiationMessage(leadId, messageText);
    showToast('Mensaje personalizado enviado al historial del prospecto y CRM');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/50 text-indigo-200 text-xs font-semibold shadow-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        agentConfig={agentConfig}
        metrics={metrics}
        onOpenAgentSettings={() => setIsAgentConfigOpen(true)}
        onOpenConfig={() => setIsAgentConfigOpen(true)}
        onRunAutonomousCycle={handleRunAutonomousCycle}
        isCycling={isCycling}
        onExportExcel={() => exportPipelineToExcel(leads, metrics, reports, auditLogs)}
        onExportPdf={() => exportPipelineToPdf(leads, metrics, reports[0])}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-mono">
              Iniciando Agente de Ventas Autónomo con IA y conectando CRM...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                leads={leads}
                metrics={metrics}
                liveFeed={liveFeed}
                onOpenLeadNegotiation={lead => setSelectedLeadForNegotiation(lead)}
                onOpenSettingsModal={() => setIsDashboardSettingsOpen(true)}
                onRunAutonomousCycle={handleRunAutonomousCycle}
                isCycling={isCycling}
                widgetConfig={widgetConfig}
                setWidgetConfig={setWidgetConfig}
              />
            )}

            {activeTab === 'pipeline' && (
              <LeadsPipelineView
                leads={leads}
                onOpenNegotiationModal={lead => setSelectedLeadForNegotiation(lead)}
                onOpenCustomizerForLead={lead => {
                  setActiveTab('customizer');
                }}
                onAddNewLead={() => setIsNewLeadModalOpen(true)}
                onSyncCrmLead={lead => handleTriggerSync(lead.crmProvider)}
              />
            )}

            {activeTab === 'customizer' && (
              <MessageCustomizerModal
                leads={leads}
                selectedLeadId={leads[0]?.id}
                onSendCustomizedMessageToLead={handleSendCustomizedToLead}
              />
            )}

            {activeTab === 'crm' && (
              <CrmSyncView
                crmProviders={crmProviders}
                leads={leads}
                auditLogs={auditLogs}
                onTriggerSync={handleTriggerSync}
                isSyncing={isSyncing}
              />
            )}

            {activeTab === 'reports' && (
              <AutomatedReportsView
                reports={reports}
                leads={leads}
                metrics={metrics}
                auditLogs={auditLogs}
                onGenerateReport={handleGenerateReport}
                isGenerating={isGeneratingReport}
              />
            )}

            {activeTab === 'security' && agentConfig && (
              <SecurityComplianceView
                auditLogs={auditLogs}
                agentConfig={agentConfig}
                onTogglePiiMasking={handleTogglePiiMasking}
                onToggleE2eEncryption={handleToggleE2eEncryption}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {selectedLeadForNegotiation && (
        <LeadNegotiationModal
          lead={selectedLeadForNegotiation}
          onClose={() => setSelectedLeadForNegotiation(null)}
          onSendMessage={handleSendNegotiationMessage}
          onMarkDealWon={handleMarkDealWon}
          isProcessing={isChatProcessing}
        />
      )}

      {agentConfig && (
        <AgentConfigModal
          config={agentConfig}
          isOpen={isAgentConfigOpen}
          onClose={() => setIsAgentConfigOpen(false)}
          onSave={handleSaveConfig}
        />
      )}

      <DashboardSettingsModal
        isOpen={isDashboardSettingsOpen}
        onClose={() => setIsDashboardSettingsOpen(false)}
        config={widgetConfig}
        onUpdateConfig={setWidgetConfig}
      />

      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onSaveLead={handleSaveNewLead}
      />
    </div>
  );
}
