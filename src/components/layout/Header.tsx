'use client'

import { useState } from 'react'
import { Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { ProfileModal } from '@/components/profile/ProfileModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

const tabTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  leads: 'Lead Management',
  pipeline: 'Sales Pipeline',
  clients: 'Client Management',
  tasks: 'Task Management',
  reports: 'Reports & Analytics',
  settings: 'Settings',
}

export function Header() {
  const router = useRouter()
  const { activeTab, currentUser, tasks, setCurrentUser, setActiveTab } = useAppStore()
  const [profileOpen, setProfileOpen] = useState(false)

  const overdueTasks = tasks.filter(t => 
    t.dueDate && 
    new Date(t.dueDate) < new Date() && 
    t.status !== 'COMPLETED'
  ).length

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSignOut = async () => {
    setCurrentUser(null)
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      {/* Left Side - Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-slate-800">
          {tabTitles[activeTab] || 'Dashboard'}
        </h1>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search..."
            className="w-64 pl-9 bg-slate-50 border-slate-200"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-slate-600" />
              {overdueTasks > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {overdueTasks}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {overdueTasks > 0 ? (
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium text-red-600">Overdue Tasks</span>
                <span className="text-sm text-slate-500">
                  You have {overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''} that need attention
                </span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-slate-500">
                No new notifications
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="w-8 h-8 bg-emerald-100">
                <AvatarFallback className="bg-emerald-500 text-white text-sm">
                  {currentUser ? getInitials(currentUser.name) : 'AD'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline font-medium text-slate-700">
                {currentUser?.name || 'Admin User'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{currentUser?.name || 'Admin User'}</span>
                <span className="text-xs font-normal text-slate-500">
                  {currentUser?.email || 'admin@bdams.com'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2" onClick={() => setProfileOpen(true)}>
              <User className="w-4 h-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2" onClick={() => setActiveTab('settings')}>
              <Settings className="w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  )
}
