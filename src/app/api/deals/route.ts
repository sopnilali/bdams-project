import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbidViewerWrites } from '@/lib/rbac'

// GET /api/deals - Get all deals
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const stageId = searchParams.get('stageId')
    const status = searchParams.get('status')
    const assignedToId = searchParams.get('assignedToId')

    const where: any = {}
    
    if (stageId && stageId !== 'all') where.stageId = stageId
    if (status && status !== 'all') where.status = status
    if (assignedToId && assignedToId !== 'all') where.assignedToId = assignedToId

    const deals = await db.deal.findMany({
      where,
      include: {
        stage: true,
        lead: {
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        client: {
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(deals)
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}

// POST /api/deals - Create a new deal
export async function POST(request: Request) {
  try {
    const forbidden = await forbidViewerWrites()
    if (forbidden) return forbidden

    const data = await request.json()
    
    const deal = await db.deal.create({
      data: {
        title: data.title,
        value: parseFloat(data.value),
        status: data.status || 'OPEN',
        probability: parseInt(data.probability) || 50,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
        description: data.description || null,
        leadId: data.leadId && data.leadId !== '__none__' ? data.leadId : null,
        clientId: data.clientId && data.clientId !== '__none__' ? data.clientId : null,
        stageId: data.stageId,
        assignedToId: data.assignedToId || null,
      },
      include: {
        stage: true,
        lead: true,
        client: true,
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json(deal)
  } catch (error) {
    console.error('Error creating deal:', error)
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
  }
}

// PUT /api/deals - Update a deal
export async function PUT(request: Request) {
  try {
    const forbidden = await forbidViewerWrites()
    if (forbidden) return forbidden

    const data = await request.json()
    const { id, ...updateData } = data

    const deal = await db.deal.update({
      where: { id },
      data: {
        title: updateData.title,
        value: parseFloat(updateData.value),
        status: updateData.status,
        probability: parseInt(updateData.probability),
        expectedCloseDate: updateData.expectedCloseDate ? new Date(updateData.expectedCloseDate) : null,
        description: updateData.description || null,
        leadId: updateData.leadId && updateData.leadId !== '__none__' ? updateData.leadId : null,
        clientId: updateData.clientId && updateData.clientId !== '__none__' ? updateData.clientId : null,
        stageId: updateData.stageId,
        assignedToId: updateData.assignedToId || null,
      },
      include: {
        stage: true,
        lead: true,
        client: true,
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json(deal)
  } catch (error) {
    console.error('Error updating deal:', error)
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
  }
}

// DELETE /api/deals - Delete a deal
export async function DELETE(request: Request) {
  try {
    const forbidden = await forbidViewerWrites()
    if (forbidden) return forbidden

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 })
    }

    await db.deal.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting deal:', error)
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 })
  }
}
