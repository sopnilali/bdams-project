'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

const defaultFormData = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'PENDING',
  dueDate: '',
  leadId: '__none__',
  clientId: '__none__',
  assignedToId: '',
}

export function TaskModal() {
  const { 
    taskModalOpen, 
    setTaskModalOpen, 
    editingTask, 
    setEditingTask,
    users,
    leads,
    clients,
    currentUser,
  } = useAppStore()

  const initialFormData = useMemo(() => {
    if (editingTask) {
      return {
        title: editingTask.title,
        description: editingTask.description || '',
        priority: editingTask.priority,
        status: editingTask.status,
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : '',
        leadId: editingTask.leadId || '__none__',
        clientId: editingTask.clientId || '__none__',
        assignedToId: editingTask.assignedToId || '',
      }
    }
    return defaultFormData
  }, [editingTask])

  const [formData, setFormData] = useState(initialFormData)

  // Reset form when modal opens with new editingTask
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setFormData(initialFormData)
    }
    setTaskModalOpen(open)
    if (!open) {
      setEditingTask(null)
    }
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
        setEditingTask(null)
      }
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  return (
    <Dialog open={taskModalOpen} onOpenChange={handleOpenChange}>
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
                    {leads.slice(0, 20).map((l) => (
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
                    {clients.slice(0, 20).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              {editingTask ? 'Update' : 'Create'} Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
