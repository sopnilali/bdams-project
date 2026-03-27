import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const userId = (token as any)?.id as string | undefined

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json({ error: 'Failed to fetch current user' }, { status: 500 })
  }
}

