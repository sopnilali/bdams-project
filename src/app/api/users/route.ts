import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hash } from 'bcryptjs'
import { forbidViewerWrites } from '@/lib/rbac'

// GET /api/users - Get all users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    const where: any = {}
    if (role && role !== 'all') where.role = role

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST /api/users - Create a new user
export async function POST(request: Request) {
  try {
    const forbidden = await forbidViewerWrites()
    if (forbidden) return forbidden

    const data = await request.json()

    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : ''
    const name = typeof data.name === 'string' ? data.name.trim() : ''
    const password = typeof data.password === 'string' ? data.password : ''

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      )
    }

    const passwordHash = await hash(password, 10)

    const user = await db.user.create({
      data: {
        email,
        name,
        password: passwordHash,
        role: data.role || 'AGENT',
        phone: data.phone || null,
        department: data.department || null,
        position: data.position || null,
        isActive: data.isActive ?? true,
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

// PUT /api/users - Update a user
export async function PUT(request: Request) {
  try {
    const forbidden = await forbidViewerWrites()
    if (forbidden) return forbidden

    const data = await request.json()
    const { id, ...updateData } = data

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const patch: any = {}
    if (typeof updateData.email === 'string') patch.email = updateData.email.trim().toLowerCase()
    if (typeof updateData.name === 'string') patch.name = updateData.name.trim()
    if (typeof updateData.role === 'string') patch.role = updateData.role
    if ('phone' in updateData) patch.phone = updateData.phone ? String(updateData.phone) : null
    if ('department' in updateData) patch.department = updateData.department ? String(updateData.department) : null
    if ('position' in updateData) patch.position = updateData.position ? String(updateData.position) : null
    if (typeof updateData.isActive === 'boolean') patch.isActive = updateData.isActive

    const user = await db.user.update({
      where: { id },
      data: patch
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE /api/users - Delete a user
export async function DELETE(request: Request) {
  try {
    const forbidden = await forbidViewerWrites()
    if (forbidden) return forbidden

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    await db.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
