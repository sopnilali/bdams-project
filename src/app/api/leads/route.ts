import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/leads - Get all leads
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const temperature = searchParams.get('temperature')
    const assignedToId = searchParams.get('assignedToId')
    const source = searchParams.get('source')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (status && status !== 'all') where.status = status
    if (temperature && temperature !== 'all') where.temperature = temperature
    if (assignedToId && assignedToId !== 'all') where.assignedToId = assignedToId
    if (source && source !== 'all') where.source = source
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }

    const leads = await db.lead.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const lead = await db.lead.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        position: data.position || null,
        source: data.source || null,
        status: data.status || 'NEW',
        temperature: data.temperature || 'COLD',
        estimatedValue: data.estimatedValue ? parseFloat(data.estimatedValue) : null,
        notes: data.notes || null,
        assignedToId: data.assignedToId || null,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}

// PUT /api/leads - Update a lead
export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    const lead = await db.lead.update({
      where: { id },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        phone: updateData.phone || null,
        company: updateData.company || null,
        position: updateData.position || null,
        source: updateData.source || null,
        status: updateData.status,
        temperature: updateData.temperature,
        estimatedValue: updateData.estimatedValue ? parseFloat(updateData.estimatedValue) : null,
        notes: updateData.notes || null,
        assignedToId: updateData.assignedToId || null,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}

// DELETE /api/leads - Delete a lead
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
    }

    await db.lead.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
