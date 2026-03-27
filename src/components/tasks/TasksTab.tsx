'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/store'
import { Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { TableSkeleton } from '@/components/shared/Skeletons'
import { PriorityBadge, TaskStatusBadge } from '@/components/shared/StatusBadges'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Search, CheckCircle2, Circle, Clock, AlertTriangle, MoreHorizontal, Edit2, Trash2, Calendar, User } from 'lucide-react'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export function TasksTab() {
  const { 
    tasks, 
    setTasks, 
    users,
    leads,
    clients,
    taskModalOpen,
    setTaskModalOpen,
    editingTask,
    setEditingTask,
    currentUser,
  } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assignedFilter, setAssignedFilter] = useState('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: '',
    leadId: '__none__',
    clientId: '__none__',
    assignedToId: '',
  })

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (priorityFilter !== 'all') params.append('priority', priorityFilter)
      if (assignedFilter !== 'all') params.append('assignedToId', assignedFilter)

      const res = await fetch(`/api/tasks?${params.toString()}`)
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, priorityFilter, assignedFilter, setTasks])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: '',
      leadId: '',
      clientId: '',
      assignedToId: '',
    })
    setEditingTask(null)
  }

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task)
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
        leadId: task.leadId || '__none__',
        clientId: task.clientId || '__none__',
        assignedToId: task.assignedToId || '',
      })
    } else {
      resetForm()
    }
    setTaskModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingTask ? 'PUT' : 'POST'
      const body = editingTask 
        ? { id: editingTask.id, ...formData, createdBy: currentUser?.id } 
        : { ...formData, createdBy: currentUser?.id }

      const res = await fetch('/api/tasks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setTaskModalOpen(false)
        resetForm()
        fetchTasks()
      }
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const handleToggleComplete = async (task: Task) => {
    try {
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          ...task,
          status: newStatus,
        }),
      })

      if (res.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const handleDelete = async () => {
    if (!taskToDelete) return
    try {
      const res = await fetch(`/api/tasks?id=${taskToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        setDeleteDialogOpen(false)
        setTaskToDelete(null)
        fetchTasks()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const getDueDateInfo = (dueDate: string | null) => {
    if (!dueDate) return { text: 'No due date', color: 'text-slate-400', icon: Clock }
    
    const date = new Date(dueDate)
    if (isPast(date) && !isToday(date)) {
      return { text: `Overdue: ${format(date, 'MMM d')}`, color: 'text-red-600', icon: AlertTriangle }
    }
    if (isToday(date)) {
      return { text: 'Due today', color: 'text-amber-600', icon: Clock }
    }
    if (isTomorrow(date)) {
      return { text: 'Due tomorrow', color: 'text-blue-600', icon: Clock }
    }
    return { text: format(date, 'MMM d, yyyy'), color: 'text-slate-500', icon: Calendar }
  }

  const columns: ColumnDef<Task>[] = [
    {
      id: 'checkbox',
      size: 40,
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.status === 'COMPLETED'}
          onCheckedChange={() => handleToggleComplete(row.original)}
        />
      ),
    },
    {
      accessorKey: 'title',
      header: 'Task',
      cell: ({ row }) => {
        const isCompleted = row.original.status === 'COMPLETED'
        return (
          <div className={cn('flex items-center gap-3', isCompleted && 'opacity-60')}>
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <Circle className="h-5 w-5 text-slate-300" />
            )}
            <div>
              <p className={cn('font-medium', isCompleted && 'line-through')}>{row.original.title}</p>
              {row.original.description && (
                <p className="text-sm text-slate-500 truncate max-w-md">{row.original.description}</p>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <TaskStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const info = getDueDateInfo(row.original.dueDate)
        const Icon = info.icon
        return (
          <div className={cn('flex items-center gap-2', info.color)}>
            <Icon className="h-4 w-4" />
            <span className="text-sm">{info.text}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-slate-600">{row.original.assignedTo?.name || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'related',
      header: 'Related To',
      cell: ({ row }) => {
        if (row.original.lead) {
          return (
            <span className="text-sm text-slate-500">
              Lead: {row.original.lead.firstName} {row.original.lead.lastName}
            </span>
          )
        }
        if (row.original.client) {
          return (
            <span className="text-sm text-slate-500">
              Client: {row.original.client.companyName}
            </span>
          )
        }
        return <span className="text-slate-400">-</span>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenModal(row.original)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => {
                setTaskToDelete(row.original)
                setDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  // Task statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    overdue: tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'COMPLETED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tasks</h2>
          <p className="text-slate-500">Manage your tasks and to-dos</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Completed</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-2xl font-bold text-slate-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {priorityOptions.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={assignedFilter} onValueChange={setAssignedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Assigned To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {users.filter(u => u.role === 'AGENT' || u.role === 'MANAGER').map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {loading ? (
        <TableSkeleton rows={10} cols={6} />
      ) : (
        <DataTable columns={columns} data={tasks} pageSize={10} />
      )}

      {/* Add/Edit Modal */}
      <Dialog open={taskModalOpen} onOpenChange={(open) => { setTaskModalOpen(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Update task details' : 'Create a new task'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedToId">Assigned To</Label>
                  <Select value={formData.assignedToId} onValueChange={(v) => setFormData({ ...formData, assignedToId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(u => u.role === 'AGENT' || u.role === 'MANAGER').map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadId">Related Lead</Label>
                  <Select value={formData.leadId} onValueChange={(v) => setFormData({ ...formData, leadId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {leads.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.firstName} {l.lastName} - {l.company}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientId">Related Client</Label>
                  <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setTaskModalOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {editingTask ? 'Update' : 'Create'} Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
