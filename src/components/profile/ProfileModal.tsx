'use client'

import { useEffect, useState } from 'react'

import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function ProfileModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { currentUser, setCurrentUser } = useAppStore()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    department: '',
    position: '',
  })
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!open) return
    setError(null)
    setPwError(null)
    setPwSuccess(null)
    setForm({
      name: currentUser?.name ?? '',
      phone: currentUser?.phone ?? '',
      department: currentUser?.department ?? '',
      position: currentUser?.position ?? '',
    })
    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }, [open, currentUser])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser?.id) return

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          name: form.name,
          phone: form.phone,
          department: form.department,
          position: form.position,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'Failed to update profile')
        setSaving(false)
        return
      }

      setCurrentUser(data)
      onOpenChange(false)
    } catch {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)
    setPwSuccess(null)

    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setPwError('Current password and new password are required')
      return
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New password and confirm password do not match')
      return
    }

    setPwSaving(true)
    try {
      const res = await fetch('/api/me/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPwError(typeof data?.error === 'string' ? data.error : 'Failed to change password')
        return
      }
      setPwSuccess('Password updated successfully')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      setPwError('Failed to change password')
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update your personal information.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !currentUser}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>

        <Separator className="my-2" />

        <form onSubmit={onChangePassword} className="space-y-4">
          <div className="text-sm font-medium">Change password</div>

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              autoComplete="new-password"
            />
          </div>

          {pwError ? <p className="text-sm text-red-600">{pwError}</p> : null}
          {pwSuccess ? <p className="text-sm text-emerald-600">{pwSuccess}</p> : null}

          <div className="flex justify-end">
            <Button type="submit" variant="outline" disabled={pwSaving || !currentUser}>
              {pwSaving ? 'Updating…' : 'Update password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

