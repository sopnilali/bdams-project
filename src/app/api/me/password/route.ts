import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { compare, hash } from 'bcryptjs'

import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = (token as any)?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : ''
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const ok = await compare(currentPassword, user.password)
    if (!ok) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

    const passwordHash = await hash(newPassword, 10)
    await db.user.update({ where: { id: userId }, data: { password: passwordHash } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}

