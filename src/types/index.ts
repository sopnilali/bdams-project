// User Types
export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER'
  avatar?: string | null
  phone?: string | null
  department?: string | null
  position?: string | null
  isActive: boolean
  lastLoginAt?: string | null
  createdAt: string
  updatedAt: string
}

// Lead Types
export interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  company?: string | null
  position?: string | null
  source?: string | null
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST'
  temperature: 'COLD' | 'WARM' | 'HOT'
  estimatedValue?: number | null
  notes?: string | null
  assignedToId?: string | null
  assignedTo?: User | null
  createdAt: string
  updatedAt: string
}

// Client Types
export interface Client {
  id: string
  companyName: string
  industry?: string | null
  website?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  primaryContactName: string
  primaryContactEmail: string
  primaryContactPhone?: string | null
  notes?: string | null
  totalRevenue: number
  dealCount: number
  assignedToId?: string | null
  assignedTo?: User | null
  createdAt: string
  updatedAt: string
}

// Pipeline Stage Types
export interface PipelineStage {
  id: string
  name: string
  color: string
  order: number
  description?: string | null
  createdAt: string
  updatedAt: string
}

// Deal Types
export interface Deal {
  id: string
  title: string
  value: number
  status: 'OPEN' | 'WON' | 'LOST'
  probability: number
  expectedCloseDate?: string | null
  description?: string | null
  leadId?: string | null
  lead?: Lead | null
  clientId?: string | null
  client?: Client | null
  stageId: string
  stage?: PipelineStage
  assignedToId?: string | null
  assignedTo?: User | null
  createdAt: string
  updatedAt: string
}

// Task Types
export interface Task {
  id: string
  title: string
  description?: string | null
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  dueDate?: string | null
  completedAt?: string | null
  leadId?: string | null
  lead?: Lead | null
  clientId?: string | null
  client?: Client | null
  assignedToId?: string | null
  assignedTo?: User | null
  createdBy?: string | null
  createdAt: string
  updatedAt: string
}

// Activity Types
export interface Activity {
  id: string
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'TASK'
  title: string
  description?: string | null
  duration?: number | null
  leadId?: string | null
  lead?: Lead | null
  clientId?: string | null
  client?: Client | null
  userId?: string | null
  user?: User | null
  createdAt: string
}

// Document Types
export interface Document {
  id: string
  name: string
  type: 'PROPOSAL' | 'CONTRACT' | 'INVOICE' | 'OTHER'
  fileUrl: string
  fileSize?: number | null
  mimeType?: string | null
  leadId?: string | null
  clientId?: string | null
  uploadedById?: string | null
  uploadedBy?: User | null
  createdAt: string
  updatedAt: string
}

// Dashboard Metrics
export interface DashboardMetrics {
  totalLeads: number
  activeDeals: number
  revenueMTD: number
  tasksDueToday: number
  leadsByStatus: { status: string; count: number }[]
  leadsBySource: { source: string; count: number }[]
  dealsByStage: { stage: string; count: number; value: number }[]
  monthlyRevenue: { month: string; revenue: number }[]
  recentActivities: Activity[]
  tasksDue: Task[]
}

// Report Types
export interface ReportData {
  salesSummary: {
    totalDeals: number
    wonDeals: number
    lostDeals: number
    conversionRate: number
    totalValue: number
    wonValue: number
  }
  revenueByMonth: { month: string; revenue: number }[]
  leadSourceAnalysis: { source: string; count: number; value: number }[]
  teamPerformance: { userId: string; userName: string; deals: number; revenue: number; leads: number }[]
  pipelineHealth: { stage: string; count: number; value: number; color: string }[]
}

// Form Types
export type LeadFormData = Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'assignedTo'>
export type ClientFormData = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'assignedTo' | 'totalRevenue' | 'dealCount'>
export type DealFormData = Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'lead' | 'client' | 'stage' | 'assignedTo'>
export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'lead' | 'client' | 'assignedTo' | 'completedAt'>
export type UserFormData = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>
