'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/store'
import { Client, Activity } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { DataTable } from '@/components/shared/DataTable'
import { TableSkeleton } from '@/components/shared/Skeletons'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Search, Building2, Mail, Phone, MapPin, Globe, DollarSign, MoreHorizontal, Edit2, Trash2, Eye, X } from 'lucide-react'
import { format } from 'date-fns'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const industries = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Consulting', 'Real Estate', 'Education', 'Transportation', 'Energy']

export function ClientsTab() {
  const { 
    clients, 
    setClients, 
    users,
    deals,
    clientModalOpen,
    setClientModalOpen,
    editingClient,
    setEditingClient,
  } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [assignedFilter, setAssignedFilter] = useState('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientActivities, setClientActivities] = useState<Activity[]>([])
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    website: '',
    address: '',
    city: '',
    country: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    notes: '',
    assignedToId: '',
  })

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (industryFilter !== 'all') params.append('industry', industryFilter)
      if (assignedFilter !== 'all') params.append('assignedToId', assignedFilter)

      const res = await fetch(`/api/clients?${params.toString()}`)
      const data = await res.json()
      setClients(data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }, [search, industryFilter, assignedFilter, setClients])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const fetchClientActivities = async (clientId: string) => {
    try {
      const res = await fetch(`/api/activities?clientId=${clientId}&limit=20`)
      const data = await res.json()
      setClientActivities(data)
    } catch (error) {
      console.error('Error fetching client activities:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      companyName: '',
      industry: '',
      website: '',
      address: '',
      city: '',
      country: '',
      primaryContactName: '',
      primaryContactEmail: '',
      primaryContactPhone: '',
      notes: '',
      assignedToId: '',
    })
    setEditingClient(null)
  }

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        companyName: client.companyName,
        industry: client.industry || '',
        website: client.website || '',
        address: client.address || '',
        city: client.city || '',
        country: client.country || '',
        primaryContactName: client.primaryContactName,
        primaryContactEmail: client.primaryContactEmail,
        primaryContactPhone: client.primaryContactPhone || '',
        notes: client.notes || '',
        assignedToId: client.assignedToId || '',
      })
    } else {
      resetForm()
    }
    setClientModalOpen(true)
  }

  const handleViewDetails = async (client: Client) => {
    setSelectedClient(client)
    setDetailPanelOpen(true)
    await fetchClientActivities(client.id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingClient ? 'PUT' : 'POST'
      const body = editingClient ? { id: editingClient.id, ...formData } : formData

      const res = await fetch('/api/clients', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setClientModalOpen(false)
        resetForm()
        fetchClients()
      }
    } catch (error) {
      console.error('Error saving client:', error)
    }
  }

  const handleDelete = async () => {
    if (!clientToDelete) return
    try {
      const res = await fetch(`/api/clients?id=${clientToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        setDeleteDialogOpen(false)
        setClientToDelete(null)
        fetchClients()
      }
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: 'companyName',
      header: 'Company',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-slate-800">{row.original.companyName}</p>
            <p className="text-sm text-slate-500">{row.original.industry || '-'}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'primaryContactName',
      header: 'Primary Contact',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.primaryContactName}</p>
          <p className="text-sm text-slate-500">{row.original.primaryContactEmail}</p>
        </div>
      ),
    },
    {
      accessorKey: 'totalRevenue',
      header: 'Revenue',
      cell: ({ row }) => (
        <span className="font-medium text-emerald-600">
          {formatCurrency(row.original.totalRevenue)}
        </span>
      ),
    },
    {
      accessorKey: 'dealCount',
      header: 'Deals',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.dealCount} deals</Badge>
      ),
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row }) => (
        <span className="text-slate-600">
          {row.original.assignedTo?.name || 'Unassigned'}
        </span>
      ),
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
            <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenModal(row.original)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => {
                setClientToDelete(row.original)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Clients</h2>
          <p className="text-slate-500">Manage your client relationships</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search clients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
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
        <TableSkeleton rows={10} cols={5} />
      ) : (
        <DataTable columns={columns} data={clients} pageSize={10} />
      )}

      {/* Add/Edit Modal */}
      <Dialog open={clientModalOpen} onOpenChange={(open) => { setClientModalOpen(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            <DialogDescription>
              {editingClient ? 'Update client information' : 'Enter details for the new client'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry} onValueChange={(v) => setFormData({ ...formData, industry: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((i) => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://"
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
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="col-span-2">
                <Separator className="my-2" />
                <h4 className="font-medium text-slate-700 mb-2">Primary Contact</h4>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primaryContactName">Contact Name *</Label>
                <Input
                  id="primaryContactName"
                  value={formData.primaryContactName}
                  onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryContactEmail">Contact Email *</Label>
                <Input
                  id="primaryContactEmail"
                  type="email"
                  value={formData.primaryContactEmail}
                  onChange={(e) => setFormData({ ...formData, primaryContactEmail: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryContactPhone">Contact Phone</Label>
                <Input
                  id="primaryContactPhone"
                  value={formData.primaryContactPhone}
                  onChange={(e) => setFormData({ ...formData, primaryContactPhone: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setClientModalOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {editingClient ? 'Update' : 'Create'} Client
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Panel */}
      <Dialog open={detailPanelOpen} onOpenChange={setDetailPanelOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              {selectedClient?.companyName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Company Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span>{selectedClient.industry || 'No industry'}</span>
                    </div>
                    {selectedClient.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-slate-400" />
                        <a href={selectedClient.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                          {selectedClient.website}
                        </a>
                      </div>
                    )}
                    {(selectedClient.city || selectedClient.country) && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{[selectedClient.city, selectedClient.country].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-emerald-600">{formatCurrency(selectedClient.totalRevenue)}</span>
                      <span className="text-slate-500">total revenue</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary">{selectedClient.dealCount} deals</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Primary Contact */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3">Primary Contact</h4>
                  <div className="space-y-2">
                    <p className="font-medium">{selectedClient.primaryContactName}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${selectedClient.primaryContactEmail}`} className="hover:text-emerald-600">
                        {selectedClient.primaryContactEmail}
                      </a>
                    </div>
                    {selectedClient.primaryContactPhone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${selectedClient.primaryContactPhone}`} className="hover:text-emerald-600">
                          {selectedClient.primaryContactPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Related Deals */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3">Related Deals</h4>
                  <div className="space-y-2">
                    {deals.filter(d => d.clientId === selectedClient.id).length > 0 ? (
                      deals.filter(d => d.clientId === selectedClient.id).map(deal => (
                        <div key={deal.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium">{deal.title}</p>
                            <p className="text-sm text-slate-500">{deal.stage?.name}</p>
                          </div>
                          <span className="font-medium text-emerald-600">{formatCurrency(deal.value)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm">No deals associated</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Recent Activity */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3">Recent Activity</h4>
                  <div className="space-y-2">
                    {clientActivities.length > 0 ? (
                      clientActivities.slice(0, 5).map(activity => (
                        <div key={activity.id} className="flex items-start gap-3 p-2">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-slate-600">{activity.type[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-slate-500">{format(new Date(activity.createdAt), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm">No recent activity</p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {clientToDelete?.companyName}? This action cannot be undone.
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
