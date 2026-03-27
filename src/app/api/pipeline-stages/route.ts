import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbidViewerWrites } from '@/lib/rbac'

// GET /api/pipeline-stages - Get all pipeline stages
export async function GET() {
  try {
    const stages = await db.pipelineStage.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(stages)
  } catch (error) {
    console.error('Error fetching pipeline stages:', error)
    return NextResponse.json({ error: 'Failed to fetch pipeline stages' }, { status: 500 })
  }
}

// POST /api/pipeline-stages - Create a new stage
export async function POST(request: Request) {
  try {
    const forbidden = await forbidViewerWrites()
    if (forbidden) return forbidden

    const data = await request.json()
    
    // Get max order
    const maxOrder = await db.pipelineStage.aggregate({
      _max: { order: true }
    })
    const order = (maxOrder._max.order || 0) + 1

    const stage = await db.pipelineStage.create({
      data: {
        name: data.name,
        color: data.color || '#64748b',
        order,
        description: data.description || null,
      }
    })

    return NextResponse.json(stage)
  } catch (error) {
    console.error('Error creating pipeline stage:', error)
    return NextResponse.json({ error: 'Failed to create pipeline stage' }, { status: 500 })
  }
}

// PUT /api/pipeline-stages - Update a stage
export async function PUT(request: Request) {
  try {
    const forbidden = await forbidViewerWrites()
    if (forbidden) return forbidden

    const data = await request.json()
    const { id, ...updateData } = data

    const stage = await db.pipelineStage.update({
      where: { id },
      data: {
        name: updateData.name,
        color: updateData.color,
        description: updateData.description || null,
      }
    })

    return NextResponse.json(stage)
  } catch (error) {
    console.error('Error updating pipeline stage:', error)
    return NextResponse.json({ error: 'Failed to update pipeline stage' }, { status: 500 })
  }
}

// DELETE /api/pipeline-stages - Delete a stage
export async function DELETE(request: Request) {
  try {
    const forbidden = await forbidViewerWrites()
    if (forbidden) return forbidden

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Stage ID is required' }, { status: 400 })
    }

    await db.pipelineStage.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pipeline stage:', error)
    return NextResponse.json({ error: 'Failed to delete pipeline stage' }, { status: 500 })
  }
}
