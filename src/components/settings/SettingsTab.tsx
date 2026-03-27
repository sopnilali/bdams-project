'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/store'
import { User, PipelineStage } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RoleBadge } from '@/components/shared/StatusBadges'
import { Plus, Edit2, Trash2, User as UserIcon, Shield, Palette, Database, MoreHorizontal } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'

const departments = ['Sales', 'Marketing', 'Operations', 'Finance', 'Human Resources']
const positions = ['Sales Manager', 'Account Executive', 'Business Developer', 'Sales Director', 'VP of Sales', 'Sales Representative', 'Marketing Specialist', 'Content Manager']
const roles = ['ADMIN', 'MANAGER', 'AGENT', 'VIEWER']

export function SettingsTab() {
  const { 
    users, 
    setUsers,
    currentUser,
    pipelineStages,
    setPipelineStages,
    userModalOpen,
    setUserModalOpen,
    editingUser,
    setEditingUser,
  } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [stageToDelete, setStageToDelete] = useState<PipelineStage | null>(null)
  const [deleteStageDialogOpen, setDeleteStageDialogOpen] = useState(false)
  const [stageModalOpen, setStageModalOpen] = useState(false)
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null)
  
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'AGENT',
    phone: '',
    department: '',
    position: '',
    isActive: true,
  })

  const [stageFormData, setStageFormData] = useState({
    name: '',
    color: '#64748b',
    description: '',
  })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/users')
      const data = await res.json()
      if (!res.ok) {
        throw new Error(typeof data?.error === 'string' ? data.error : 'Failed to fetch users')
      }

      const usersList = Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : []
      setUsers(usersList)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [setUsers])

  const fetchPipelineStages = useCallback(async () => {
    try {
      const res = await fetch('/api/pipeline-stages')
      const data = await res.json()
      setPipelineStages(data)
    } catch (error) {
      console.error('Error fetching pipeline stages:', error)
    }
  }, [setPipelineStages])

  useEffect(() => {
    fetchUsers()
    fetchPipelineStages()
  }, [fetchUsers, fetchPipelineStages])

  const resetUserForm = () => {
    setUserFormData({
      name: '',
      email: '',
      role: 'AGENT',
      phone: '',
      department: '',
      position: '',
      isActive: true,
    })
    setEditingUser(null)
  }

  const resetStageForm = () => {
    setStageFormData({
      name: '',
      color: '#64748b',
      description: '',
    })
    setEditingStage(null)
  }

  const handleOpenUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setUserFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || '',
        isActive: user.isActive,
      })
    } else {
      resetUserForm()
    }
    setUserModalOpen(true)
  }

  const handleOpenStageModal = (stage?: PipelineStage) => {
    if (stage) {
      setEditingStage(stage)
      setStageFormData({
        name: stage.name,
        color: stage.color,
        description: stage.description || '',
      })
    } else {
      resetStageForm()
    }
    setStageModalOpen(true)
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingUser ? 'PUT' : 'POST'
      const body = editingUser ? { id: editingUser.id, ...userFormData } : userFormData

      const res = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setUserModalOpen(false)
        resetUserForm()
        fetchUsers()
      }
    } catch (error) {
      console.error('Error saving user:', error)
    }
  }

  const handleStageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingStage ? 'PUT' : 'POST'
      const body = editingStage ? { id: editingStage.id, ...stageFormData } : stageFormData

      const res = await fetch('/api/pipeline-stages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setStageModalOpen(false)
        resetStageForm()
        fetchPipelineStages()
      }
    } catch (error) {
      console.error('Error saving stage:', error)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    try {
      const res = await fetch(`/api/users?id=${userToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        setDeleteDialogOpen(false)
        setUserToDelete(null)
        fetchUsers()
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleDeleteStage = async () => {
    if (!stageToDelete) return
    try {
      const res = await fetch(`/api/pipeline-stages?id=${stageToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        setDeleteStageDialogOpen(false)
        setStageToDelete(null)
        fetchPipelineStages()
      }
    } catch (error) {
      console.error('Error deleting stage:', error)
    }
  }

  const isAdmin = currentUser?.role === 'ADMIN'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500">Manage your account and application settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white">
            <UserIcon className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-white" disabled={!isAdmin}>
            <Shield className="w-4 h-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="data-[state=active]:bg-white" disabled={!isAdmin}>
            <Database className="w-4 h-4 mr-2" />
            Pipeline
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-600">
                    {currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{currentUser?.name}</h3>
                  <p className="text-slate-500">{currentUser?.email}</p>
                  <RoleBadge role={currentUser?.role || 'VIEWER'} />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={currentUser?.name || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={currentUser?.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={currentUser?.department || '-'} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input value={currentUser?.position || '-'} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={currentUser?.phone || '-'} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={currentUser?.role || '-'} disabled />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">Account Status</p>
                  <p className="text-sm text-slate-500">Your account is active</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Manage team members and their roles</CardDescription>
              </div>
              {isAdmin && (
                <Button onClick={() => handleOpenUserModal()} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead className="w-12"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-emerald-600">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><RoleBadge role={user.role} /></TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>{user.position || '-'}</TableCell>
                      <TableCell>
                        <Badge className={user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenUserModal(user)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setUserToDelete(user)
                                  setDeleteDialogOpen(true)
                                }}
                                disabled={user.id === currentUser?.id}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pipeline Stages</CardTitle>
                <CardDescription>Configure your sales pipeline stages</CardDescription>
              </div>
              {isAdmin && (
                <Button onClick={() => handleOpenStageModal()} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stage
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineStages.map((stage) => (
                  <div 
                    key={stage.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <div>
                        <p className="font-medium">{stage.name}</p>
                        <p className="text-sm text-slate-500">{stage.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Order: {stage.order}</Badge>
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenStageModal(stage)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setStageToDelete(stage)
                                setDeleteStageDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Modal */}
      <Dialog open={userModalOpen} onOpenChange={(open) => { setUserModalOpen(open); if (!open) resetUserForm() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information' : 'Create a new team member'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUserSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={userFormData.role} onValueChange={(v) => setUserFormData({ ...userFormData, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={userFormData.department} onValueChange={(v) => setUserFormData({ ...userFormData, department: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select value={userFormData.position} onValueChange={(v) => setUserFormData({ ...userFormData, position: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active Status</Label>
                <Switch
                  id="isActive"
                  checked={userFormData.isActive}
                  onCheckedChange={(checked) => setUserFormData({ ...userFormData, isActive: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setUserModalOpen(false); resetUserForm() }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {editingUser ? 'Update' : 'Create'} User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stage Modal */}
      <Dialog open={stageModalOpen} onOpenChange={(open) => { setStageModalOpen(open); if (!open) resetStageForm() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStage ? 'Edit Stage' : 'Add New Stage'}</DialogTitle>
            <DialogDescription>
              {editingStage ? 'Update pipeline stage' : 'Create a new pipeline stage'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStageSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="stageName">Stage Name *</Label>
                <Input
                  id="stageName"
                  value={stageFormData.name}
                  onChange={(e) => setStageFormData({ ...stageFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="color"
                    type="color"
                    value={stageFormData.color}
                    onChange={(e) => setStageFormData({ ...stageFormData, color: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={stageFormData.color}
                    onChange={(e) => setStageFormData({ ...stageFormData, color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={stageFormData.description}
                  onChange={(e) => setStageFormData({ ...stageFormData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setStageModalOpen(false); resetStageForm() }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {editingStage ? 'Update' : 'Create'} Stage
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Stage Dialog */}
      <AlertDialog open={deleteStageDialogOpen} onOpenChange={setDeleteStageDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pipeline Stage</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{stageToDelete?.name}"? This will affect all deals in this stage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStage} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
