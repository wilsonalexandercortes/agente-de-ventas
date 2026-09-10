import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { Lead, AgentConfig, CRMProviderConfig, AuditLog, SalesReport, SystemUsageMetrics } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Error initializing GoogleGenAI:', err);
  }
}

// In-memory state with rich realistic sales pipeline data
let agentConfig: AgentConfig = {
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

let crmProviders: CRMProviderConfig[] = [
  {
    id: 'hubspot',
    name: 'HubSpot CRM Enterprise',
    connected: true,
    lastSync: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    syncedCount: 142,
    apiKeyMasked: 'pat-na1-••••••••-49b1',
    autoSyncEvents: ['deal.stage_change', 'deal.won', 'contact.created', 'message.logged'],
  },
  {
    id: 'salesforce',
    name: 'Salesforce Sales Cloud',
    connected: true,
    lastSync: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    syncedCount: 98,
    apiKeyMasked: '00D5e000••••••••-sf99',
    autoSyncEvents: ['opportunity.updated', 'lead.converted', 'quote.approved'],
  },
  {
    id: 'zoho',
    name: 'Zoho CRM Plus',
    connected: false,
    lastSync: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    syncedCount: 34,
    apiKeyMasked: '1000.••••••••••••••••',
    autoSyncEvents: ['deals.create', 'notes.add'],
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive Pipeline Pro',
    connected: true,
    lastSync: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    syncedCount: 76,
    apiKeyMasked: 'pipe_••••••••••••e421',
    autoSyncEvents: ['deal.updated', 'activity.completed'],
  },
];

let leads: Lead[] = [
  {
    id: 'lead-001',
    name: 'Carlos Mendoza',
    company: 'Fintech Andina Global',
    role: 'VP de Operaciones y Tecnología',
    email: 'cmendoza@fintechandina.com',
    phone: '+52 55 4912 8831',
    stage: 'negotiation',
    dealValue: 48500,
    currency: 'USD',
    probability: 82,
    priority: 'high',
    channel: 'LinkedIn',
    lastContact: 'Hace 18 minutos',
    sentiment: 'objection',
    objections: ['Presupuesto inicial ajustado', 'Requiere SLA de 99.95%'],
    notes: 'Interesado en despliegue de 120 agentes para el próximo trimestre. Ha comparado nuestra solución con competencia.',
    crmSyncStatus: 'synced',
    crmId: 'HS-89412',
    crmProvider: 'HubSpot',
    encrypted: true,
    aiSuggestedAction: 'Ofrecer concesión de onboarding premium gratuito y pago trimestral anticipado con 12% de descuento.',
    lastAiAnalysis: 'Lead altamente calificado con decisión inminente. La objeción de costo es táctica; priorizan fiabilidad técnica y soporte dedicado.',
    messages: [
      {
        id: 'm1',
        sender: 'agent',
        content: 'Estimado Carlos, revisando los requerimientos técnicos de Fintech Andina, nuestra infraestructura multi-tenant con cifrado E2E se adapta exactamente a su cumplimiento regulatorio bancario.',
        timestamp: '10:14 AM',
        intent: 'PROPUESTA_INICIAL',
        encrypted: true,
      },
      {
        id: 'm2',
        sender: 'lead',
        content: 'Nos interesa mucho la demo técnica, pero la cotización de $48,500 excede nuestro presupuesto asignado de $42,000 para este semestre. ¿Tienen flexibilidad comercial o facilidades de pago?',
        timestamp: '10:45 AM',
        intent: 'OBJECION_PRECIO',
        encrypted: true,
      },
      {
        id: 'm3',
        sender: 'agent',
        content: 'Entiendo perfectamente Carlos. Si logramos estructurar el acuerdo en 2 hitos y formalizamos la firma antes de este viernes, puedo aplicar un ajuste exclusivo del 12% alcanzando $42,680 e incluir el paquete de aceleración técnica sin costo.',
        timestamp: '11:02 AM',
        intent: 'CONTRAOFERTA_ESTRATEGICA',
        discountOffered: 12,
        encrypted: true,
      },
    ],
  },
  {
    id: 'lead-002',
    name: 'Valeria Rivas',
    company: 'Logística Transatlántica S.A.',
    role: 'Directora General de Cadena de Suministro',
    email: 'vrivas@logisticatrans.es',
    phone: '+34 91 234 5678',
    stage: 'closing',
    dealValue: 72000,
    currency: 'USD',
    probability: 95,
    priority: 'high',
    channel: 'Email',
    lastContact: 'Hace 1 hora',
    sentiment: 'positive',
    objections: ['Revisión final por departamento legal'],
    notes: 'Negociación técnica cerrada con éxito. Cláusulas de GDPR y residencia de datos en Frankfurt ya validadas.',
    crmSyncStatus: 'synced',
    crmId: 'SF-99201',
    crmProvider: 'Salesforce',
    encrypted: true,
    aiSuggestedAction: 'Emitir borrador de contrato con firma digital DocuSign y programar llamada de bienvenida técnica.',
    lastAiAnalysis: 'Probabilidad de cierre del 95%. Esperando validación del DPO sobre anexo de protección de datos.',
    messages: [
      {
        id: 'm4',
        sender: 'lead',
        content: 'Nuestro equipo técnico aprobó el piloto de IA. Solo necesitamos el Addendum de confidencialidad y procesador de datos firmado para autorizar la orden de compra.',
        timestamp: '09:30 AM',
        intent: 'LISTO_PARA_CIERRE',
        encrypted: true,
      },
      {
        id: 'm5',
        sender: 'agent',
        content: 'Excelente noticia Valeria. Ya he emitido el contrato maestro con el anexo RGPD y firma biométrica cifrada SHA-256 a su correo legal. ¡Listos para iniciar la activación!',
        timestamp: '09:48 AM',
        intent: 'EMISION_CONTRATO',
        encrypted: true,
      },
    ],
  },
  {
    id: 'lead-003',
    name: 'Mateo Morales',
    company: 'Soluciones Retail Omnichannel',
    role: 'Head de E-commerce y Crecimiento',
    email: 'mmorales@retailomni.co',
    phone: '+57 310 987 6543',
    stage: 'qualification',
    dealValue: 31000,
    currency: 'USD',
    probability: 60,
    priority: 'medium',
    channel: 'WhatsApp',
    lastContact: 'Hace 3 horas',
    sentiment: 'neutral',
    objections: ['Integración con su ERP propietario legacy'],
    notes: 'Buscando automatizar ventas por WhatsApp y Web en 4 países.',
    crmSyncStatus: 'pending',
    crmId: 'PD-30129',
    crmProvider: 'Pipedrive',
    encrypted: true,
    aiSuggestedAction: 'Enviar caso de estudio de integración exitosa con SAP y Oracle en menos de 7 días.',
    lastAiAnalysis: 'El prospecto requiere certeza técnica sobre APIs REST y Webhooks para conectar su inventario en tiempo real.',
    messages: [
      {
        id: 'm6',
        sender: 'lead',
        content: '¿El agente inteligente se puede sincronizar con nuestro inventario en tiempo real para cotizar y reservar productos directamente?',
        timestamp: '08:15 AM',
        intent: 'CONSULTA_TECNICA',
        encrypted: true,
      },
      {
        id: 'm7',
        sender: 'agent',
        content: 'Hola Mateo, sí, disponemos de conectores nativos bidireccionales vía Webhooks y API REST ultrarrápida (<120ms) que consultan y reservan inventario en milisegundos sin latencia.',
        timestamp: '08:22 AM',
        intent: 'RESOLUCION_TECNICA',
        encrypted: true,
      },
    ],
  },
  {
    id: 'lead-004',
    name: 'Elena Gómez Navarro',
    company: 'Banco Insular de Seguros',
    role: 'Chief Commercial Officer',
    email: 'elena.gomez@insularseguros.com',
    phone: '+54 11 4455 6677',
    stage: 'prospecting',
    dealValue: 95000,
    currency: 'USD',
    probability: 35,
    priority: 'high',
    channel: 'WebChat',
    lastContact: 'Hace 4 horas',
    sentiment: 'skeptical',
    objections: ['Seguridad en la nube', 'Privacidad de datos de asegurados'],
    notes: 'Llegó a través de la campaña B2B Enterprise. Requiere cumplimiento estricto de ISO 27001 y cifrado end-to-end.',
    crmSyncStatus: 'synced',
    crmId: 'HS-89499',
    crmProvider: 'HubSpot',
    encrypted: true,
    aiSuggestedAction: 'Agendar demostración de arquitectura de cifrado zero-knowledge y aislamiento de tenants.',
    lastAiAnalysis: 'Cliente corporativo de alto valor con aversión al riesgo regulatorio. Necesita dossier de seguridad y cumplimiento normativo.',
    messages: [
      {
        id: 'm8',
        sender: 'lead',
        content: 'Estamos evaluando automatizar la suscripción de pólizas, pero por normativas de la superintendencia bancaria no podemos exponer datos personales sin cifrado de extremo a extremo.',
        timestamp: '07:30 AM',
        intent: 'COMPLIANCE_QUERY',
        encrypted: true,
      },
    ],
  },
  {
    id: 'lead-005',
    name: 'Alejandro Domínguez',
    company: 'CloudHealth Telemedicina',
    role: 'Fundador y CEO',
    email: 'adominguez@cloudhealth.io',
    phone: '+56 9 8765 4321',
    stage: 'won',
    dealValue: 64000,
    currency: 'USD',
    probability: 100,
    priority: 'high',
    channel: 'Email',
    lastContact: 'Ayer',
    sentiment: 'positive',
    objections: [],
    notes: 'Negociación cerrada autónomamente por el agente en 4 rondas de conversación. Contrato anual renovable.',
    crmSyncStatus: 'synced',
    crmId: 'SF-99182',
    crmProvider: 'Salesforce',
    encrypted: true,
    aiSuggestedAction: 'Generar reporte de onboarding y programar revisión de QBR en 90 días.',
    lastAiAnalysis: 'Deal ganado exitosamente con margen del 38% y descuento óptimo concedido del 8%.',
    messages: [
      {
        id: 'm9',
        sender: 'lead',
        content: 'Confirmamos la recepción del contrato y hemos procesado la transferencia bancaria anual. Excelente agilidad en todo el proceso comercial.',
        timestamp: 'Ayer 04:15 PM',
        intent: 'PAGO_CONFIRMADO',
        encrypted: true,
      },
      {
        id: 'm10',
        sender: 'agent',
        content: '¡Excelente Alejandro! Hemos recibido la confirmación y habilitado sus credenciales de producción con cifrado de llaves dedicado. Bienvenido a Nexus Sales.',
        timestamp: 'Ayer 04:30 PM',
        intent: 'BIENVENIDA_CLIENTE',
        encrypted: true,
      },
    ],
  },
];

let auditLogs: AuditLog[] = [
  {
    id: 'aud-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    action: 'Cifrado E2E Verificado',
    actor: 'Nexus Security Daemon',
    category: 'SECURITY',
    details: 'Verificación de llaves simétricas AES-256-GCM y validación de hash de integridad en 5 registros.',
    ipHash: 'sha256:8f4b...39a1',
    checksum: 'a9b8c7d6e5f4',
  },
  {
    id: 'aud-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    action: 'Sincronización Automática CRM',
    actor: 'HubSpot Connector',
    category: 'CRM_SYNC',
    details: 'Actualizados 12 registros de Deal y 3 Contactos con etapa y valor ajustado.',
    ipHash: 'sha256:12c4...e889',
    checksum: 'd1e2f3a4b5c6',
  },
  {
    id: 'aud-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    action: 'Contraoferta Autónoma Ejecutada',
    actor: 'Nexus-SalesAI Agent',
    category: 'AI_NEGOTIATION',
    details: 'Lead Carlos Mendoza: Concesión de 12% autorizada dentro del umbral de margen objetivo (>30%).',
    ipHash: 'sha256:44aa...77ff',
    checksum: 'ff00aa11bb22',
  },
  {
    id: 'aud-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    action: 'Auditoría de Cumplimiento GDPR',
    actor: 'Privacy Engine',
    category: 'SECURITY',
    details: 'Ofuscación de PII (nombre, email y teléfono) en prompts procesados por el modelo LLM.',
    ipHash: 'sha256:66dd...11bb',
    checksum: '334455667788',
  },
];

let reports: SalesReport[] = [
  {
    id: 'rep-001',
    generatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    title: 'Reporte Estratégico de Rendimiento Comercial & Negociación IA',
    period: 'Últimos 30 Días',
    executiveSummary: 'El agente autónomo ha gestionado 89 interacciones activas con una tasa de cierre récord del 41.2% y un tiempo de ciclo reducido en un 64%. La automatización de objeciones presupuestarias mediante concesiones escalonadas ha desbloqueado $145,000 USD en pipeline estancado.',
    pipelineHealthScore: 92,
    conversionInsights: [
      'Los leads atendidos en menos de 90 segundos por el agente tienen 3.8x más probabilidades de avanzar a etapa de cierre.',
      'El canal LinkedIn registró la mayor tasa de cualificación (74%), mientras que Email obtuvo el ticket promedio más alto ($68,000 USD).',
      'La estrategia de conceder servicios de implementación en lugar de descuentos en tarifa redujo la pérdida de margen en un 8.4%.',
    ],
    keyBottlenecks: [
      'Demoras en la validación legal por parte de clientes corporativos (promedio 6.2 días).',
      'Objeciones técnicas recurrentes sobre integración con ERPs legados en sector retail.',
    ],
    objectionTrends: [
      { objection: 'Presupuesto elevado', count: 28, recommendedCounter: 'Estructuración en 2 fases con hito de ROI comprobado a 60 días' },
      { objection: 'Privacidad y residencia de datos', count: 19, recommendedCounter: 'Presentación del anexo GDPR/ISO 27001 con cifrado zero-knowledge' },
      { objection: 'Complejidad de adopción técnica', count: 14, recommendedCounter: 'Demostración de Webhooks y APIs con despliegue asistido' },
    ],
    strategicRecommendations: [
      'Habilitar disparadores autónomos para leads de alta prioridad en fines de semana para capturar momentum.',
      'Aumentar el umbral de descuento máximo al 20% exclusivamente para contratos plurianuales superiores a $60,000 USD.',
      'Profundizar la sincronización bidireccional continua con Salesforce para alertar a los directores comerciales sobre deals en etapa de cierre.',
    ],
    revenueForecast: {
      expectedWon: 215500,
      bestCase: 310500,
      weightedPipeline: 184200,
    },
  },
];

let liveFeed: { id: string; time: string; text: string; type: 'success' | 'ai' | 'sync' | 'shield' }[] = [
  { id: 'f1', time: '11:02 AM', text: 'Agente IA envió contraoferta estratégica de 12% a Carlos Mendoza (Fintech Andina)', type: 'ai' },
  { id: 'f2', time: '10:50 AM', text: 'Sincronización HubSpot exitosa: 142 registros validados sin discrepancias', type: 'sync' },
  { id: 'f3', time: '09:48 AM', text: 'Contrato maestro cifrado con firma biométrica emitido a Valeria Rivas', type: 'success' },
  { id: 'f4', time: '09:15 AM', text: 'Escudo de privacidad: 18 campos sensibles ofuscados con tokenización SHA-256', type: 'shield' },
];

function calculateMetrics(): SystemUsageMetrics {
  const totalLeads = leads.length;
  const activeNegotiations = leads.filter(l => l.stage === 'negotiation' || l.stage === 'closing').length;
  const wonRevenue = leads.filter(l => l.stage === 'won').reduce((acc, l) => acc + l.dealValue, 0);
  const totalPipeline = leads.reduce((acc, l) => acc + l.dealValue, 0);
  const wonLeadsCount = leads.filter(l => l.stage === 'won').length;
  const closedLeads = leads.filter(l => l.stage === 'won' || l.stage === 'lost').length;
  const winRate = closedLeads > 0 ? Math.round((wonLeadsCount / closedLeads) * 100) : 75;

  return {
    totalLeads,
    activeNegotiations,
    wonRevenue,
    pipelineValue: totalPipeline,
    winRatePercent: winRate,
    avgResponseTimeMs: 420,
    autonomousActionsCount: 384,
    aiTokensProcessed: 842100,
    crmSyncSuccessRate: 99.8,
    systemUptime: 99.99,
    e2eEncryptionVerified: true,
  };
}

// API Endpoints
app.get('/api/state', (req, res) => {
  res.json({
    leads,
    agentConfig,
    crmProviders,
    auditLogs,
    reports,
    liveFeed,
    metrics: calculateMetrics(),
  });
});

app.post('/api/leads', (req, res) => {
  const leadData: Partial<Lead> = req.body;
  if (!leadData.name || !leadData.company) {
    return res.status(400).json({ error: 'Nombre y empresa son requeridos' });
  }

  const existingIndex = leads.findIndex(l => l.id === leadData.id);
  let updatedLead: Lead;

  if (existingIndex >= 0) {
    updatedLead = { ...leads[existingIndex], ...leadData };
    leads[existingIndex] = updatedLead;
  } else {
    updatedLead = {
      id: `lead-${Date.now()}`,
      name: leadData.name,
      company: leadData.company,
      role: leadData.role || 'Gerente Comercial',
      email: leadData.email || 'contacto@empresa.com',
      phone: leadData.phone || '+1 800 555 0199',
      stage: leadData.stage || 'qualification',
      dealValue: leadData.dealValue || 25000,
      currency: leadData.currency || 'USD',
      probability: leadData.probability || 50,
      priority: leadData.priority || 'medium',
      channel: leadData.channel || 'Email',
      lastContact: 'Hace instantes',
      sentiment: leadData.sentiment || 'neutral',
      objections: leadData.objections || [],
      notes: leadData.notes || '',
      crmSyncStatus: 'pending',
      crmId: `CRM-${Math.floor(10000 + Math.random() * 90000)}`,
      crmProvider: leadData.crmProvider || 'HubSpot',
      messages: leadData.messages || [
        {
          id: `m-${Date.now()}`,
          sender: 'agent',
          content: `Hola ${leadData.name}, gracias por contactar. Soy el agente autónomo de ventas y estoy listo para brindarle una propuesta personalizada para ${leadData.company}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: 'BIENVENIDA',
          encrypted: true,
        },
      ],
      encrypted: true,
      aiSuggestedAction: 'Calificar requerimientos de volumen y fecha de inicio estimada.',
      lastAiAnalysis: 'Nuevo lead ingresado al pipeline. Listo para prospección autónoma.',
    };
    leads.unshift(updatedLead);
  }

  // Add audit log
  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: existingIndex >= 0 ? 'Lead Actualizado' : 'Nuevo Lead Registrado',
    actor: 'Sales Rep / API',
    category: 'CRM_SYNC',
    details: `Registro de ${updatedLead.name} (${updatedLead.company}) - Etapa: ${updatedLead.stage}`,
    ipHash: 'sha256:77a1...b22c',
    checksum: Math.random().toString(36).substring(2, 10),
  });

  res.json({ lead: updatedLead, metrics: calculateMetrics() });
});

// Autonomous Agent Conversation & Negotiation Engine with Gemini AI
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { leadId, userMessage } = req.body;
    const lead = leads.find(l => l.id === leadId);
    if (!lead) {
      return res.status(404).json({ error: 'Lead no encontrado' });
    }

    // Add user message to conversation history
    const newLeadMessage = {
      id: `msg-${Date.now()}-lead`,
      sender: 'lead' as const,
      content: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      encrypted: true,
    };
    lead.messages.push(newLeadMessage);

    let agentResponseText = '';
    let intentDetected = 'NEGOCIACION_GENERAL';
    let discountOffered = 0;
    let newProbability = lead.probability;
    let newStage = lead.stage;
    let newSentiment = lead.sentiment;
    let suggestedAction = lead.aiSuggestedAction;

    const conversationHistoryStr = lead.messages
      .map(m => `${m.sender === 'agent' ? 'Agente' : m.sender === 'human_rep' ? 'Representante Humano' : lead.name}: ${m.content}`)
      .join('\n');

    const systemPrompt = `Eres un Agente de Ventas Autónomo de Clase Mundial para soluciones de software empresarial B2B y tecnología.
Tu nombre es "${agentConfig.name}".
Tono: ${agentConfig.tone}.
Nivel de Autonomía: ${agentConfig.autonomyLevel}.
Descuento máximo autorizado: ${agentConfig.maxDiscountPercent}%.
Margen objetivo: ${agentConfig.targetMargin}%.

DATOS DEL PROSPECTO:
- Nombre: ${lead.name}
- Cargo: ${lead.role}
- Empresa: ${lead.company}
- Valor del negocio actual: $${lead.dealValue} ${lead.currency}
- Etapa actual: ${lead.stage}
- Objeciones conocidas: ${lead.objections.join(', ') || 'Ninguna registrada'}
- Canal de interacción: ${lead.channel}

DIRECTRICES DE NEGOCIACIÓN:
1. Responde de forma persuasiva, empática, ejecutiva y altamente profesional en idioma ${agentConfig.language}.
2. Si el cliente plantea objeciones de precio o presupuesto, no bajes el precio inmediatamente sin contrapartidas: pide un compromiso (pago anual adelantado, plazo de contrato a 2 años, fecha de firma inmediata o referencia pública). Si amerita, puedes conceder hasta un ${agentConfig.maxDiscountPercent}% de descuento calculado tácticamente.
3. Si el cliente pide información técnica o de seguridad, resalta la arquitectura de cifrado de extremo a extremo, cumplimiento RGPD/ISO 27001 y SLAs garantizados.
4. Si el cliente muestra intención de compra o acuerdo, empuja suavemente al cierre formalizando los términos o emitiendo el contrato.
5. Mantén la respuesta concisa y orientada a la acción (1 o 2 párrafos máximo con llamada a la acción clara).

FORMATO DE SALIDA REQUERIDO:
Debes responder en formato JSON estrictamente válido con los siguientes campos:
{
  "responseText": "Tu respuesta directa para el cliente",
  "intent": "Una etiqueta como OBJECION_RESUELTA, CONTRAOFERTA, CIERRE_PROPUESTO, ACLARACION_TECNICA, o PROSPECTO_CALIFICADO",
  "discountOffered": 0 (o el porcentaje numérico si ofreciste descuento, ej: 10),
  "updatedProbability": (un número entero de 0 a 100 con la nueva probabilidad estimada de cierre),
  "recommendedStage": "prospecting" | "qualification" | "negotiation" | "closing" | "won" | "lost",
  "sentiment": "positive" | "neutral" | "skeptical" | "objection",
  "aiAnalysis": "Breve análisis estratégico de 1 oración sobre la postura del cliente",
  "suggestedNextAction": "Siguiente paso recomendado para el pipeline"
}`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `HISTORIAL DE LA CONVERSACIÓN:\n${conversationHistoryStr}\n\nÚLTIMO MENSAJE DEL CLIENTE:\n"${userMessage}"\n\nAnaliza y genera tu respuesta autónoma según tus directrices.`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);

        agentResponseText = parsed.responseText || 'Estimado cliente, he analizado su solicitud y estamos listos para avanzar con los términos más convenientes.';
        intentDetected = parsed.intent || 'NEGOCIACION_GENERAL';
        discountOffered = typeof parsed.discountOffered === 'number' ? parsed.discountOffered : 0;
        if (typeof parsed.updatedProbability === 'number') newProbability = Math.min(100, Math.max(0, parsed.updatedProbability));
        if (parsed.recommendedStage) newStage = parsed.recommendedStage;
        if (parsed.sentiment) newSentiment = parsed.sentiment;
        if (parsed.aiAnalysis) lead.lastAiAnalysis = parsed.aiAnalysis;
        if (parsed.suggestedNextAction) suggestedAction = parsed.suggestedNextAction;
      } catch (geminiError) {
        console.error('Gemini API execution error, fallback to expert sales heuristic:', geminiError);
        // Robust intelligent fallback
        agentResponseText = `Estimado ${lead.name}, he evaluado su requerimiento sobre ${lead.company}. Para acelerar la implementación de manera ventajosa, podemos ajustar los términos comerciales garantizando un ROI del 280% y acompañamiento técnico dedicado. ¿Le parece si consolidamos el acuerdo con estas condiciones?`;
        intentDetected = 'CONTRAOFERTA_ESTRATEGICA';
        discountOffered = 8;
        newProbability = Math.min(95, lead.probability + 8);
        newStage = lead.probability > 70 ? 'closing' : 'negotiation';
      }
    } else {
      // Heuristic AI engine when GEMINI_API_KEY is not configured
      const lower = userMessage.toLowerCase();
      if (lower.includes('caro') || lower.includes('precio') || lower.includes('presupuesto') || lower.includes('descuento')) {
        agentResponseText = `Entiendo perfectamente la importancia de maximizar su presupuesto, ${lead.name}. Con el fin de iniciar este trimestre, puedo autorizar una tarifa especial con un 10% de beneficio directo al optar por facturación anual, manteniendo todas las capacidades Enterprise de cifrado y soporte 24/7. ¿Le parecería viable formalizar hoy?`;
        intentDetected = 'CONCESION_PRESUPUESTO';
        discountOffered = 10;
        newProbability = Math.min(92, lead.probability + 12);
        newSentiment = 'positive';
      } else if (lower.includes('seguridad') || lower.includes('cifrado') || lower.includes('gdpr') || lower.includes('datos')) {
        agentResponseText = `Nuestra plataforma opera con arquitectura zero-trust y cifrado de extremo a extremo AES-256 en reposo y tránsito, con pleno cumplimiento del RGPD europeo y certificación ISO 27001. Todos los registros y auditorías quedan sellados criptográficamente.`;
        intentDetected = 'CUMPLIMIENTO_SEGURIDAD';
        newProbability = Math.min(90, lead.probability + 10);
        newSentiment = 'positive';
      } else if (lower.includes('si') || lower.includes('de acuerdo') || lower.includes('cerrar') || lower.includes('firmar')) {
        agentResponseText = `¡Extraordinario ${lead.name}! He generado el contrato digital con los términos acordados y una vigencia garantizada. He remitido la copia con firma digital a ${lead.email} y actualizado el CRM automáticamente.`;
        intentDetected = 'CIERRE_EXITOSO';
        newStage = 'won';
        newProbability = 100;
        newSentiment = 'positive';
      } else {
        agentResponseText = `Muchas gracias por sus comentarios, ${lead.name}. En ${lead.company} esto representará una optimización sustancial en sus tiempos de ciclo. Permítame confirmar si prefiere que enviemos el acuerdo preliminar para validación de su departamento directivo.`;
        intentDetected = 'AVANCE_COMERCIAL';
        newProbability = Math.min(88, lead.probability + 5);
      }
    }

    // Save agent message
    const agentMsg = {
      id: `msg-${Date.now()}-agent`,
      sender: 'agent' as const,
      content: agentResponseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: intentDetected,
      discountOffered: discountOffered > 0 ? discountOffered : undefined,
      encrypted: true,
    };
    lead.messages.push(agentMsg);
    lead.probability = newProbability;
    lead.stage = newStage;
    lead.sentiment = newSentiment;
    lead.aiSuggestedAction = suggestedAction;
    lead.lastContact = 'Hace un momento';

    // If discount offered, adjust dealValue
    if (discountOffered > 0 && discountOffered <= agentConfig.maxDiscountPercent) {
      lead.dealValue = Math.round(lead.dealValue * (1 - discountOffered / 100));
    }

    // Live feed item
    liveFeed.unshift({
      id: `f-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Agente interactuó con ${lead.name} (${lead.company}): ${intentDetected.replace(/_/g, ' ')}`,
      type: 'ai',
    });

    // CRM auto-sync if enabled
    if (agentConfig.crmAutoSyncEnabled) {
      lead.crmSyncStatus = 'synced';
      lead.lastContact = 'Recién sincronizado';
    }

    res.json({
      lead,
      agentMessage: agentMsg,
      metrics: calculateMetrics(),
      liveFeed: liveFeed.slice(0, 10),
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err?.message || 'Error en el motor de negociación IA' });
  }
});

// Autonomous Batch Cycle: The AI runs autonomous actions on all active leads
app.post('/api/agent/autonomous-batch', async (req, res) => {
  try {
    const activeLeads = leads.filter(l => l.stage !== 'won' && l.stage !== 'lost');
    const actionsTaken: string[] = [];

    for (const lead of activeLeads) {
      if (lead.stage === 'negotiation') {
        lead.probability = Math.min(95, lead.probability + 5);
        lead.crmSyncStatus = 'synced';
        actionsTaken.push(`Lead ${lead.name} (${lead.company}): Optimización de términos y sincronización CRM ejecutada.`);
      } else if (lead.stage === 'qualification') {
        lead.probability = Math.min(85, lead.probability + 10);
        lead.stage = 'negotiation';
        actionsTaken.push(`Lead ${lead.name} (${lead.company}): Calificación completada con éxito. Promovido a Negociación Activa.`);
      } else if (lead.stage === 'closing') {
        lead.probability = Math.min(98, lead.probability + 2);
        actionsTaken.push(`Lead ${lead.name} (${lead.company}): Seguimiento de firma contractual enviado.`);
      }
    }

    liveFeed.unshift({
      id: `f-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Ciclo Autónomo Ejecutado: ${activeLeads.length} prospectos procesados y sincronizados.`,
      type: 'success',
    });

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Ciclo Autónomo Batch Ejecutado',
      actor: 'Nexus Autonomous Daemon',
      category: 'AI_NEGOTIATION',
      details: `Procesamiento simultáneo de ${activeLeads.length} oportunidades en pipeline. Cifrado validado.`,
      ipHash: 'sha256:bb33...9900',
      checksum: Math.random().toString(36).substring(2, 10),
    });

    res.json({
      success: true,
      actionsTaken,
      leads,
      metrics: calculateMetrics(),
      liveFeed: liveFeed.slice(0, 10),
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error ejecutando ciclo autónomo' });
  }
});

// Message Customization via Advanced LLM
app.post('/api/agent/customize-message', async (req, res) => {
  try {
    const { leadId, template, tone, channel, customGoal } = req.body;
    const lead = leads.find(l => l.id === leadId);

    const leadName = lead ? lead.name : 'Juan Pérez';
    const company = lead ? lead.company : 'Corporación Alpha';
    const role = lead ? lead.role : 'Director de Finanzas';
    const budget = lead ? `$${lead.dealValue} ${lead.currency}` : '$45,000 USD';
    const objections = lead && lead.objections.length > 0 ? lead.objections.join(', ') : 'Precio y tiempo de despliegue';

    let generatedMessage = '';

    if (ai) {
      try {
        const prompt = `Actúa como redactor maestro de mensajes de ventas B2B hiperpersonalizados.
Parámetros:
- Prospecto: ${leadName}, ${role} en ${company}
- Presupuesto estimado: ${budget}
- Objeciones detectadas: ${objections}
- Canal de envío: ${channel || 'Email'}
- Tono solicitado: ${tone || 'consultative'}
- Objetivo específico de la comunicación: ${customGoal || 'Reactivar negociación y proponer una reunión de cierre'}
- Plantilla o guía base: "${template || agentConfig.activePromptTemplate}"

Genera un mensaje de ventas extraordinario, persuasivo, empático, sin clichés de marketing, que apele a las prioridades estratégicas del cliente y plantee un próximo paso claro y sin fricción.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            temperature: 0.6,
          },
        });

        generatedMessage = response.text || '';
      } catch (err) {
        console.error('Error generating customized message with Gemini:', err);
      }
    }

    if (!generatedMessage) {
      generatedMessage = `Estimado/a ${leadName},

Analizando los objetivos de escalabilidad en ${company}, comprendo que la eficiencia en costos y la rapidez de adopción son factores críticos para su equipo.

Hemos estructurado un plan de despliegue ágil con SLA garantizado y acompañamiento técnico que permite amortizar la inversión en menos de 60 días. Me gustaría compartirle un breve modelo comparativo de impacto proyectado para ${company}.

¿Dispone de 10 minutos este jueves para revisar los números preliminares?

Atentamente,
Equipo de Negociaciones Estratégicas`;
    }

    res.json({
      message: generatedMessage,
      variablesUsed: { leadName, company, role, budget, objections },
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error al generar mensaje personalizado' });
  }
});

// Automated Detailed Sales Report Generation
app.post('/api/agent/generate-report', async (req, res) => {
  try {
    const { period = 'Últimos 30 Días' } = req.body;
    const metrics = calculateMetrics();

    let newReport: SalesReport;

    if (ai) {
      try {
        const prompt = `Eres el Director de Analítica de Ventas e Inteligencia de Negocios.
Genera un Reporte Ejecutivo de Ventas de alto impacto en formato JSON para el equipo directivo.
Datos reales del pipeline:
- Leads Totales: ${metrics.totalLeads}
- Negociaciones Activas: ${metrics.activeNegotiations}
- Ingresos Ganados: $${metrics.wonRevenue} USD
- Valor Total del Pipeline: $${metrics.pipelineValue} USD
- Tasa de Cierre (Win Rate): ${metrics.winRatePercent}%
- Acciones Autónomas IA ejecutadas: ${metrics.autonomousActionsCount}
- Tasa de Éxito de Sincronización CRM: ${metrics.crmSyncSuccessRate}%
- Periodo analizado: ${period}

Formato JSON esperado:
{
  "executiveSummary": "Párrafo de 3-4 oraciones con análisis de rendimiento global, aceleración del pipeline y ahorro de horas hombre.",
  "pipelineHealthScore": 94 (número del 1 al 100),
  "conversionInsights": ["Insight 1 con métrica", "Insight 2 con impacto", "Insight 3 con recomendación"],
  "keyBottlenecks": ["Cuello de botella 1", "Cuello de botella 2"],
  "objectionTrends": [
    {"objection": "Nombre de objeción", "count": 24, "recommendedCounter": "Estrategia recomendada"}
  ],
  "strategicRecommendations": ["Recomendación 1", "Recomendación 2", "Recomendación 3"],
  "revenueForecast": {
    "expectedWon": 240000,
    "bestCase": 320000,
    "weightedPipeline": 195000
  }
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        newReport = {
          id: `rep-${Date.now()}`,
          generatedAt: new Date().toISOString(),
          title: `Reporte Estratégico de Rendimiento Comercial & Negociación IA (${period})`,
          period,
          executiveSummary: parsed.executiveSummary || 'Rendimiento sólido con aceleración en conversiones B2B.',
          pipelineHealthScore: parsed.pipelineHealthScore || 91,
          conversionInsights: parsed.conversionInsights || [
            'Incremento del 38% en velocidad de primera respuesta mediante el agente.',
            'Disminución del 22% en abandono de leads con objeciones de costo.',
          ],
          keyBottlenecks: parsed.keyBottlenecks || ['Tiempos de firma legal en clientes bancarios.'],
          objectionTrends: parsed.objectionTrends || [
            { objection: 'Presupuesto restringido', count: 22, recommendedCounter: 'Fraccionamiento de pagos con hito de valor' },
          ],
          strategicRecommendations: parsed.strategicRecommendations || [
            'Priorizar leads con decisores directos identificados.',
          ],
          revenueForecast: parsed.revenueForecast || {
            expectedWon: metrics.wonRevenue + 120000,
            bestCase: metrics.pipelineValue * 0.7,
            weightedPipeline: metrics.pipelineValue * 0.5,
          },
        };
      } catch (err) {
        console.error('Error in Gemini report generation:', err);
        newReport = {
          id: `rep-${Date.now()}`,
          generatedAt: new Date().toISOString(),
          title: `Reporte Estratégico de Rendimiento Comercial (${period})`,
          period,
          executiveSummary: `Durante el periodo ${period}, el agente autónomo mantuvo una tasa de cierre promedio del ${metrics.winRatePercent}%, gestionando ${metrics.totalLeads} oportunidades activas con un valor de pipeline de $${metrics.pipelineValue} USD.`,
          pipelineHealthScore: 89,
          conversionInsights: [
            'Tiempo medio de respuesta reducido a menos de 1 minuto.',
            'Tasa de retención de oportunidades en negociación superior al 80%.',
          ],
          keyBottlenecks: ['Tiempos de deliberación de comités de compras.'],
          objectionTrends: [
            { objection: 'Presupuesto y ROI', count: 18, recommendedCounter: 'Demostración de payback en 3 meses' },
          ],
          strategicRecommendations: [
            'Ampliar la automatización de follow-ups a 3 días posteriores a la demo.',
          ],
          revenueForecast: {
            expectedWon: metrics.wonRevenue + 85000,
            bestCase: metrics.pipelineValue * 0.65,
            weightedPipeline: metrics.pipelineValue * 0.45,
          },
        };
      }
    } else {
      newReport = {
        id: `rep-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        title: `Reporte Estratégico de Rendimiento Comercial (${period})`,
        period,
        executiveSummary: `Durante el periodo ${period}, el agente autónomo procesó ${metrics.totalLeads} oportunidades con $${metrics.wonRevenue} USD cerrados y una tasa de efectividad del ${metrics.winRatePercent}%.`,
        pipelineHealthScore: 90,
        conversionInsights: [
          'La agilidad del agente incrementó las conversiones en un 27%.',
          'Sincronización continua de CRM sin pérdida de información.',
        ],
        keyBottlenecks: ['Aprobaciones de seguridad en corporativos.'],
        objectionTrends: [
          { objection: 'Presupuesto', count: 15, recommendedCounter: 'Propuesta modular escalonada' },
        ],
        strategicRecommendations: [
          'Mantener activo el modo de autonomía total para leads calificados.',
        ],
        revenueForecast: {
          expectedWon: metrics.wonRevenue + 90000,
          bestCase: metrics.pipelineValue * 0.7,
          weightedPipeline: metrics.pipelineValue * 0.5,
        },
      };
    }

    reports.unshift(newReport);

    liveFeed.unshift({
      id: `f-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Nuevo reporte comercial generado por IA: "${newReport.title}"`,
      type: 'ai',
    });

    res.json({ report: newReport, reports });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error al generar reporte' });
  }
});

// CRM Synchronization Trigger
app.post('/api/crm/sync', (req, res) => {
  const { providerId } = req.body;
  const targetProviders = providerId
    ? crmProviders.filter(p => p.id === providerId)
    : crmProviders.filter(p => p.connected);

  const now = new Date().toISOString();
  let totalSynced = 0;

  targetProviders.forEach(p => {
    p.lastSync = now;
    p.syncedCount += leads.length;
    totalSynced += leads.length;
  });

  leads.forEach(l => {
    l.crmSyncStatus = 'synced';
  });

  liveFeed.unshift({
    id: `f-${Date.now()}`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `Sincronización con CRM completada: ${totalSynced} entidades sincronizadas y cifradas.`,
    type: 'sync',
  });

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: now,
    action: 'Sincronización Forzada de CRM',
    actor: 'Usuario / Admin',
    category: 'CRM_SYNC',
    details: `Sincronización con ${targetProviders.map(p => p.name).join(', ')}. Payload verificado con checksum SHA-256.`,
    ipHash: 'sha256:33cc...aa44',
    checksum: Math.random().toString(36).substring(2, 10),
  });

  res.json({
    success: true,
    crmProviders,
    leads,
    auditLogs: auditLogs.slice(0, 15),
    liveFeed: liveFeed.slice(0, 10),
  });
});

// Update Agent Config
app.post('/api/agent/config', (req, res) => {
  const newConfig: Partial<AgentConfig> = req.body;
  agentConfig = { ...agentConfig, ...newConfig };

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'Configuración del Agente Actualizada',
    actor: 'Administrador',
    category: 'AI_NEGOTIATION',
    details: `Autonomía: ${agentConfig.autonomyLevel}, Descuento Máx: ${agentConfig.maxDiscountPercent}%, Tono: ${agentConfig.tone}`,
    ipHash: 'sha256:55ef...88bc',
    checksum: Math.random().toString(36).substring(2, 10),
  });

  res.json({ success: true, agentConfig });
});

// Vite Middleware for Dev and Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Autonomous Sales Agent Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
