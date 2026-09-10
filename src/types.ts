export type LeadStage = 'prospecting' | 'qualification' | 'negotiation' | 'closing' | 'won' | 'lost';

export type ChannelType = 'Email' | 'WhatsApp' | 'LinkedIn' | 'WebChat' | 'Llamada';

export type PriorityLevel = 'high' | 'medium' | 'low';

export type SentimentType = 'positive' | 'neutral' | 'skeptical' | 'objection';

export interface MessageItem {
  id: string;
  sender: 'lead' | 'agent' | 'human_rep';
  content: string;
  timestamp: string;
  intent?: string;
  discountOffered?: number;
  encrypted?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  stage: LeadStage;
  dealValue: number;
  currency: string;
  probability: number; // 0 - 100
  priority: PriorityLevel;
  channel: ChannelType;
  lastContact: string;
  sentiment: SentimentType;
  objections: string[];
  notes: string;
  crmSyncStatus: 'synced' | 'pending' | 'error';
  crmId: string;
  crmProvider: 'HubSpot' | 'Salesforce' | 'Zoho' | 'Pipedrive';
  messages: MessageItem[];
  encrypted: boolean;
  aiSuggestedAction?: string;
  lastAiAnalysis?: string;
}

export type AutonomyLevel = 'full' | 'semi' | 'supervised';
export type AgentTone = 'consultative' | 'assertive' | 'friendly' | 'enterprise_b2b';

export interface AgentConfig {
  name: string;
  autonomyLevel: AutonomyLevel;
  maxDiscountPercent: number;
  targetMargin: number;
  tone: AgentTone;
  language: string;
  personaDescription: string;
  activePromptTemplate: string;
  autoFollowUpHours: number;
  crmAutoSyncEnabled: boolean;
  e2eEncryptionEnabled: boolean;
  piiMaskingEnabled: boolean;
  privacyCompliance: 'GDPR' | 'CCPA' | 'ISO27001' | 'HIPAA_ALIGNED';
}

export interface CRMProviderConfig {
  id: 'hubspot' | 'salesforce' | 'zoho' | 'pipedrive';
  name: string;
  connected: boolean;
  lastSync: string;
  syncedCount: number;
  apiKeyMasked: string;
  autoSyncEvents: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  category: 'SECURITY' | 'CRM_SYNC' | 'AI_NEGOTIATION' | 'DATA_EXPORT';
  details: string;
  ipHash: string;
  checksum: string;
}

export interface SalesReport {
  id: string;
  generatedAt: string;
  title: string;
  period: string;
  executiveSummary: string;
  pipelineHealthScore: number;
  conversionInsights: string[];
  keyBottlenecks: string[];
  objectionTrends: { objection: string; count: number; recommendedCounter: string }[];
  strategicRecommendations: string[];
  revenueForecast: {
    expectedWon: number;
    bestCase: number;
    weightedPipeline: number;
  };
}

export interface SystemUsageMetrics {
  totalLeads: number;
  activeNegotiations: number;
  wonRevenue: number;
  pipelineValue: number;
  winRatePercent: number;
  avgResponseTimeMs: number;
  autonomousActionsCount: number;
  aiTokensProcessed: number;
  crmSyncSuccessRate: number;
  systemUptime: number;
  e2eEncryptionVerified: boolean;
}

export interface DashboardWidgetConfig {
  showKpis: boolean;
  showFunnel: boolean;
  showRevenueChart: boolean;
  showLiveAgentActivity: boolean;
  showChannelPerformance: boolean;
  showObjectionCloud: boolean;
  showSystemMetrics: boolean;
  timeframe: 'today' | '7d' | '30d' | 'quarter';
}
