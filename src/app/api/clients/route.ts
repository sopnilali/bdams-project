import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/clients - Get all clients
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const industry = searchParams.get('industry')
    const assignedToId = searchParams.get('assignedToId')

    const where: any = {}
    
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { primaryContactName: { contains: search, mode: 'insensitive' } },
        { primaryContactEmail: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (industry && industry !== 'all') where.industry = industry
    if (assignedToId && assignedToId !== 'all') where.assignedToId = assignedToId

    const clients = await db.client.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        },
        deals: {
          select: { id: true, title: true, value: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

// POST /api/clients - Create a new client
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const client = await db.client.create({
      data: {
        companyName: data.companyName,
        industry: data.industry || null,
        website: data.website || null,
        address: data.address || null,
        city: data.city || null,
        country: data.country || null,
        primaryContactName: data.primaryContactName,
        primaryContactEmail: data.primaryContactEmail,
        primaryContactPhone: data.primaryContactPhone || null,
        notes: data.notes || null,
        assignedToId: data.assignedToId || null,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}

// PUT /api/clients - Update a client
export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    const client = await db.client.update({
      where: { id },
      data: {
        companyName: updateData.companyName,
        industry: updateData.industry || null,
        website: updateData.website || null,
        address: updateData.address || null,
        city: updateData.city || null,
        country: updateData.country || null,
        primaryContactName: updateData.primaryContactName,
        primaryContactEmail: updateData.primaryContactEmail,
        primaryContactPhone: updateData.primaryContactPhone || null,
        notes: updateData.notes || null,
        assignedToId: updateData.assignedToId || null,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

// DELETE /api/clients - Delete a client
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }

    await db.client.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
