import { create } from 'zustand'
import { User, Lead, Client, Deal, Task, PipelineStage, Activity } from '@/types'

export type TabType = 'dashboard' | 'leads' | 'pipeline' | 'clients' | 'tasks' | 'reports' | 'settings'

interface AppState {
  // Navigation
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  
  // Current user (demo - admin)
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  
  // Users
  users: User[]
  setUsers: (users: User[]) => void
  
  // Leads
  leads: Lead[]
  setLeads: (leads: Lead[]) => void
  
  // Clients
  clients: Client[]
  setClients: (clients: Client[]) => void
  
  // Deals
  deals: Deal[]
  setDeals: (deals: Deal[]) => void
  
  // Tasks
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  
  // Pipeline Stages
  pipelineStages: PipelineStage[]
  setPipelineStages: (stages: PipelineStage[]) => void
  
  // Activities
  activities: Activity[]
  setActivities: (activities: Activity[]) => void
  
  // UI State
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  
  // Modal States
  leadModalOpen: boolean
  setLeadModalOpen: (open: boolean) => void
  editingLead: Lead | null
  setEditingLead: (lead: Lead | null) => void
  
  clientModalOpen: boolean
  setClientModalOpen: (open: boolean) => void
  editingClient: Client | null
  setEditingClient: (client: Client | null) => void
  
  dealModalOpen: boolean
  setDealModalOpen: (open: boolean) => void
  editingDeal: Deal | null
  setEditingDeal: (deal: Deal | null) => void
  
  taskModalOpen: boolean
  setTaskModalOpen: (open: boolean) => void
  editingTask: Task | null
  setEditingTask: (task: Task | null) => void
  
  userModalOpen: boolean
  setUserModalOpen: (open: boolean) => void
  editingUser: User | null
  setEditingUser: (user: User | null) => void
  
  // Detail Panel
  selectedLeadId: string | null
  setSelectedLeadId: (id: string | null) => void
  selectedClientId: string | null
  setSelectedClientId: (id: string | null) => void
  selectedDealId: string | null
  setSelectedDealId: (id: string | null) => void
  
  // Loading States
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Current user
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  
  // Users
  users: [],
  setUsers: (users) => set({ users }),
  
  // Leads
  leads: [],
  setLeads: (leads) => set({ leads }),
  
  // Clients
  clients: [],
  setClients: (clients) => set({ clients }),
  
  // Deals
  deals: [],
  setDeals: (deals) => set({ deals }),
  
  // Tasks
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  
  // Pipeline Stages
  pipelineStages: [],
  setPipelineStages: (stages) => set({ pipelineStages: stages }),
  
  // Activities
  activities: [],
  setActivities: (activities) => set({ activities }),
  
  // UI State
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  // Modal States
  leadModalOpen: false,
  setLeadModalOpen: (open) => set({ leadModalOpen: open }),
  editingLead: null,
  setEditingLead: (lead) => set({ editingLead: lead }),
  
  clientModalOpen: false,
  setClientModalOpen: (open) => set({ clientModalOpen: open }),
  editingClient: null,
  setEditingClient: (client) => set({ editingClient: client }),
  
  dealModalOpen: false,
  setDealModalOpen: (open) => set({ dealModalOpen: open }),
  editingDeal: null,
  setEditingDeal: (deal) => set({ editingDeal: deal }),
  
  taskModalOpen: false,
  setTaskModalOpen: (open) => set({ taskModalOpen: open }),
  editingTask: null,
  setEditingTask: (task) => set({ editingTask: task }),
  
  userModalOpen: false,
  setUserModalOpen: (open) => set({ userModalOpen: open }),
  editingUser: null,
  setEditingUser: (user) => set({ editingUser: user }),
  
  // Detail Panel
  selectedLeadId: null,
  setSelectedLeadId: (id) => set({ selectedLeadId: id }),
  selectedClientId: null,
  setSelectedClientId: (id) => set({ selectedClientId: id }),
  selectedDealId: null,
  setSelectedDealId: (id) => set({ selectedDealId: id }),
  
  // Loading States
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}))
