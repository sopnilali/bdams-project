'use client'

import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  Building2, 
  CheckSquare, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, TabType } from '@/store'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

const navigation = [
  { name: 'Dashboard', id: 'dashboard' as TabType, icon: LayoutDashboard },
  { name: 'Leads', id: 'leads' as TabType, icon: Users },
  { name: 'Pipeline', id: 'pipeline' as TabType, icon: Kanban },
  { name: 'Clients', id: 'clients' as TabType, icon: Building2 },
  { name: 'Tasks', id: 'tasks' as TabType, icon: CheckSquare },
  { name: 'Reports', id: 'reports' as TabType, icon: BarChart3 },
  { name: 'Settings', id: 'settings' as TabType, icon: Settings },
]

export function Sidebar() {
  const { activeTab, setActiveTab, sidebarCollapsed, setSidebarCollapsed } = useAppStore()

  return (
    <TooltipProvider delayDuration={0}>
      <div 
        className={cn(
          "flex flex-col h-screen bg-slate-900 text-white transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-slate-700">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">BD</span>
              </div>
              <span className="font-semibold text-lg">BDAMS</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = activeTab === item.id
            const Icon = item.icon
            
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                      isActive 
                        ? "bg-emerald-600 text-white" 
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
                  </button>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-2 border-t border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full text-slate-300 hover:text-white hover:bg-slate-800"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 mx-auto" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
