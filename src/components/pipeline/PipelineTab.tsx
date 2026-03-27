'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/store'
import { Deal, PipelineStage } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { DealStatusBadge } from '@/components/shared/StatusBadges'
import { Plus, GripVertical, DollarSign, Calendar, User, MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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

interface DealCardProps {
  deal: Deal
  onEdit: (deal: Deal) => void
  onDelete: (deal: Deal) => void
}

function DealCard({ deal, onEdit, onDelete }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-slate-200 p-4 mb-3 shadow-sm hover:shadow-md transition-shadow ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-slate-800 text-sm line-clamp-2 flex-1">{deal.title}</h4>
        <div className="flex items-center gap-1">
          <button {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-slate-100 rounded">
            <GripVertical className="w-4 h-4 text-slate-400" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(deal)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDelete(deal)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold text-emerald-600">{formatCurrency(deal.value)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="bg-slate-100 px-2 py-0.5 rounded">{deal.probability}%</span>
          {deal.expectedCloseDate && (
            <>
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(deal.expectedCloseDate), 'MMM d')}</span>
            </>
          )}
        </div>
        
        {deal.assignedTo && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <User className="w-3 h-3" />
            <span className="truncate">{deal.assignedTo.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface StageColumnProps {
  stage: PipelineStage
  deals: Deal[]
  onAddDeal: (stageId: string) => void
  onEditDeal: (deal: Deal) => void
  onDeleteDeal: (deal: Deal) => void
}

function StageColumn({ stage, deals, onAddDeal, onEditDeal, onDeleteDeal }: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  })

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="flex-shrink-0 w-72">
      <div 
        className="rounded-lg p-3 mb-3"
        style={{ backgroundColor: `${stage.color}20` }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <h3 className="font-semibold text-slate-800">{stage.name}</h3>
          </div>
          <span className="text-sm font-medium text-slate-500">{deals.length}</span>
        </div>
        <p className="text-sm text-slate-600">{formatCurrency(totalValue)}</p>
      </div>
      
      <div 
        ref={setNodeRef}
        className={`min-h-96 space-y-0 rounded-lg transition-colors ${isOver ? 'bg-slate-100' : ''}`}
      >
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            onEdit={onEditDeal}
            onDelete={onDeleteDeal}
          />
        ))}
        
        <Button
          variant="ghost"
          className="w-full border-2 border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400"
          onClick={() => onAddDeal(stage.id)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>
    </div>
  )
}

export function PipelineTab() {
  const { 
    deals, 
    setDeals, 
    pipelineStages, 
    users,
    leads,
    clients,
    dealModalOpen,
    setDealModalOpen,
    editingDeal,
    setEditingDeal,
    setLeadModalOpen,
  } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    status: 'OPEN',
    probability: '50',
    expectedCloseDate: '',
    description: '',
    leadId: '',
    clientId: '',
    stageId: '',
    assignedToId: '',
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/deals')
      const data = await res.json()
      setDeals(data)
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setLoading(false)
    }
  }, [setDeals])

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const dealId = active.id as string
    const newStageId = over.id as string

    // Find the deal and check if stage changed
    const deal = deals.find(d => d.id === dealId)
    if (!deal || deal.stageId === newStageId) return

    try {
      // Update deal stage
      const res = await fetch('/api/deals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dealId,
          ...deal,
          stageId: newStageId,
        }),
      })

      if (res.ok) {
        fetchDeals()
      }
    } catch (error) {
      console.error('Error updating deal stage:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      value: '',
      status: 'OPEN',
      probability: '50',
      expectedCloseDate: '',
      description: '',
      leadId: '__none__',
      clientId: '__none__',
      stageId: '',
      assignedToId: '',
    })
    setEditingDeal(null)
  }

  const handleOpenModal = (deal?: Deal, stageId?: string) => {
    if (deal) {
      setEditingDeal(deal)
      setFormData({
        title: deal.title,
        value: deal.value.toString(),
        status: deal.status,
        probability: deal.probability.toString(),
        expectedCloseDate: deal.expectedCloseDate ? format(new Date(deal.expectedCloseDate), 'yyyy-MM-dd') : '',
        description: deal.description || '',
        leadId: deal.leadId || '__none__',
        clientId: deal.clientId || '__none__',
        stageId: deal.stageId,
        assignedToId: deal.assignedToId || '',
      })
    } else {
      resetForm()
      if (stageId) {
        setFormData(prev => ({ ...prev, stageId }))
      }
    }
    setDealModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingDeal ? 'PUT' : 'POST'
      const body = editingDeal 
        ? { id: editingDeal.id, ...formData } 
        : formData

      const res = await fetch('/api/deals', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setDealModalOpen(false)
        resetForm()
        fetchDeals()
      }
    } catch (error) {
      console.error('Error saving deal:', error)
    }
  }

  const handleDelete = async () => {
    if (!dealToDelete) return
    try {
      const res = await fetch(`/api/deals?id=${dealToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        setDeleteDialogOpen(false)
        setDealToDelete(null)
        fetchDeals()
      }
    } catch (error) {
      console.error('Error deleting deal:', error)
    }
  }

  // Get deals by stage
  const dealsByStage: Record<string, Deal[]> = {}
  pipelineStages.forEach(stage => {
    dealsByStage[stage.id] = deals.filter(d => d.stageId === stage.id && d.status === 'OPEN')
  })

  const activeDeal = activeId ? deals.find(d => d.id === activeId) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sales Pipeline</h2>
          <p className="text-slate-500">Drag and drop deals between stages</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              deals={dealsByStage[stage.id] || []}
              onAddDeal={(stageId) => handleOpenModal(undefined, stageId)}
              onEditDeal={handleOpenModal}
              onDeleteDeal={(deal) => {
                setDealToDelete(deal)
                setDeleteDialogOpen(true)
              }}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal ? (
            <DealCard
              deal={activeDeal}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add/Edit Modal */}
      <Dialog open={dealModalOpen} onOpenChange={(open) => { setDealModalOpen(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDeal ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
            <DialogDescription>
              {editingDeal ? 'Update deal information' : 'Create a new deal'}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probability">Probability %</Label>
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stageId">Stage *</Label>
                  <Select value={formData.stageId} onValueChange={(v) => setFormData({ ...formData, stageId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {pipelineStages.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
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
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="WON">Won</SelectItem>
                      <SelectItem value="LOST">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                  <Input
                    id="expectedCloseDate"
                    type="date"
                    value={formData.expectedCloseDate}
                    onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
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
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setDealModalOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {editingDeal ? 'Update' : 'Create'} Deal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{dealToDelete?.title}"? This action cannot be undone.
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
