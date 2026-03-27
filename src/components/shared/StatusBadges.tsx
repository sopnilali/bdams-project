'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Status Badge Component
const statusStyles: Record<string, { bg: string; text: string }> = {
  NEW: { bg: 'bg-slate-100', text: 'text-slate-700' },
  CONTACTED: { bg: 'bg-blue-100', text: 'text-blue-700' },
  QUALIFIED: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  PROPOSAL: { bg: 'bg-amber-100', text: 'text-amber-700' },
  NEGOTIATION: { bg: 'bg-purple-100', text: 'text-purple-700' },
  WON: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  LOST: { bg: 'bg-red-100', text: 'text-red-700' },
}

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || statusStyles.NEW
  
  return (
    <Badge variant="outline" className={cn('font-medium border-0', style.bg, style.text)}>
      {status}
    </Badge>
  )
}

// Temperature Badge Component
const temperatureStyles: Record<string, { bg: string; text: string }> = {
  COLD: { bg: 'bg-blue-100', text: 'text-blue-700' },
  WARM: { bg: 'bg-amber-100', text: 'text-amber-700' },
  HOT: { bg: 'bg-red-100', text: 'text-red-700' },
}

export function TemperatureBadge({ temperature }: { temperature: string }) {
  const style = temperatureStyles[temperature] || temperatureStyles.COLD
  
  return (
    <Badge variant="outline" className={cn('font-medium border-0', style.bg, style.text)}>
      {temperature}
    </Badge>
  )
}

// Priority Badge Component
const priorityStyles: Record<string, { bg: string; text: string }> = {
  LOW: { bg: 'bg-slate-100', text: 'text-slate-700' },
  MEDIUM: { bg: 'bg-amber-100', text: 'text-amber-700' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700' },
  URGENT: { bg: 'bg-red-100', text: 'text-red-700' },
}

export function PriorityBadge({ priority }: { priority: string }) {
  const style = priorityStyles[priority] || priorityStyles.MEDIUM
  
  return (
    <Badge variant="outline" className={cn('font-medium border-0', style.bg, style.text)}>
      {priority}
    </Badge>
  )
}

// Task Status Badge Component
const taskStatusStyles: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-slate-100', text: 'text-slate-700' },
  IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700' },
  COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700' },
}

export function TaskStatusBadge({ status }: { status: string }) {
  const style = taskStatusStyles[status] || taskStatusStyles.PENDING
  
  return (
    <Badge variant="outline" className={cn('font-medium border-0', style.bg, style.text)}>
      {status.replace('_', ' ')}
    </Badge>
  )
}

// Deal Status Badge Component
const dealStatusStyles: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: 'bg-blue-100', text: 'text-blue-700' },
  WON: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  LOST: { bg: 'bg-red-100', text: 'text-red-700' },
}

export function DealStatusBadge({ status }: { status: string }) {
  const style = dealStatusStyles[status] || dealStatusStyles.OPEN
  
  return (
    <Badge variant="outline" className={cn('font-medium border-0', style.bg, style.text)}>
      {status}
    </Badge>
  )
}

// Role Badge Component
const roleStyles: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: 'bg-purple-100', text: 'text-purple-700' },
  MANAGER: { bg: 'bg-blue-100', text: 'text-blue-700' },
  AGENT: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  VIEWER: { bg: 'bg-slate-100', text: 'text-slate-700' },
}

export function RoleBadge({ role }: { role: string }) {
  const style = roleStyles[role] || roleStyles.VIEWER
  
  return (
    <Badge variant="outline" className={cn('font-medium border-0', style.bg, style.text)}>
      {role}
    </Badge>
  )
}

// Activity Type Badge
const activityStyles: Record<string, { bg: string; text: string }> = {
  CALL: { bg: 'bg-green-100', text: 'text-green-700' },
  EMAIL: { bg: 'bg-blue-100', text: 'text-blue-700' },
  MEETING: { bg: 'bg-purple-100', text: 'text-purple-700' },
  NOTE: { bg: 'bg-amber-100', text: 'text-amber-700' },
  TASK: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
}

export function ActivityTypeBadge({ type }: { type: string }) {
  const style = activityStyles[type] || activityStyles.NOTE
  
  return (
    <Badge variant="outline" className={cn('font-medium border-0', style.bg, style.text)}>
      {type}
    </Badge>
  )
}
