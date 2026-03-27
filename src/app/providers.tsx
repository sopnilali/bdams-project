'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { useEffect } from 'react'

import { useAppStore } from '@/store'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync />
      {children}
    </SessionProvider>
  )
}

function SessionSync() {
  const { status, data: session } = useSession()
  const { setCurrentUser } = useAppStore()

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (status !== 'authenticated') {
        setCurrentUser(null)
        return
      }

      // Fast path: reflect session immediately (prevents "old user" flash)
      if (session?.user && !cancelled) {
        setCurrentUser({
          id: (session.user as any).id,
          email: session.user.email ?? '',
          name: session.user.name ?? '',
          role: (session.user as any).role,
          isActive: true,
          createdAt: '',
          updatedAt: '',
        } as any)
      }

      // Then hydrate full user from DB (department/phone/etc)
      const res = await fetch('/api/me')
      const data = await res.json()

      if (cancelled) return

      if (!res.ok) {
        return
      }

      setCurrentUser(data)
    }

    run()

    return () => {
      cancelled = true
    }
  }, [status, session, setCurrentUser])

  return null
}

