'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { DashboardTab } from '@/components/dashboard/DashboardTab'
import { LeadsTab } from '@/components/leads/LeadsTab'
import { PipelineTab } from '@/components/pipeline/PipelineTab'
import { ClientsTab } from '@/components/clients/ClientsTab'
import { TasksTab } from '@/components/tasks/TasksTab'
import { ReportsTab } from '@/components/reports/ReportsTab'
import { SettingsTab } from '@/components/settings/SettingsTab'
import { TaskModal } from '@/components/tasks/TaskModal'
import { cn } from '@/lib/utils'

export default function Home() {
  const { activeTab, sidebarCollapsed } = useAppStore()

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'leads' && <LeadsTab />}
            {activeTab === 'pipeline' && <PipelineTab />}
            {activeTab === 'clients' && <ClientsTab />}
            {activeTab === 'tasks' && <TasksTab />}
            {activeTab === 'reports' && <ReportsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </main>
      </div>

      {/* Global Task Modal */}
      <TaskModal />
    </div>
  )
}
