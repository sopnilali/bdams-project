import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/tasks - Get all tasks
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedToId = searchParams.get('assignedToId')
    const overdue = searchParams.get('overdue')

    const where: any = {}
    
    if (status && status !== 'all') where.status = status
    if (priority && priority !== 'all') where.priority = priority
    if (assignedToId && assignedToId !== 'all') where.assignedToId = assignedToId
    if (overdue === 'true') {
      where.dueDate = { lt: new Date() }
      where.status = { not: 'COMPLETED' }
    }

    const tasks = await db.task.findMany({
      where,
      include: {
        lead: {
          select: { id: true, firstName: true, lastName: true, company: true }
        },
        client: {
          select: { id: true, companyName: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' }
      ]
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const task = await db.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        priority: data.priority || 'MEDIUM',
        status: data.status || 'PENDING',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        leadId: data.leadId && data.leadId !== '__none__' ? data.leadId : null,
        clientId: data.clientId && data.clientId !== '__none__' ? data.clientId : null,
        assignedToId: data.assignedToId || null,
        createdBy: data.createdBy || null,
      },
      include: {
        lead: {
          select: { id: true, firstName: true, lastName: true, company: true }
        },
        client: {
          select: { id: true, companyName: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

// PUT /api/tasks - Update a task
export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    const task = await db.task.update({
      where: { id },
      data: {
        title: updateData.title,
        description: updateData.description || null,
        priority: updateData.priority,
        status: updateData.status,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : null,
        completedAt: updateData.status === 'COMPLETED' ? new Date() : null,
        leadId: updateData.leadId && updateData.leadId !== '__none__' ? updateData.leadId : null,
        clientId: updateData.clientId && updateData.clientId !== '__none__' ? updateData.clientId : null,
        assignedToId: updateData.assignedToId || null,
      },
      include: {
        lead: {
          select: { id: true, firstName: true, lastName: true, company: true }
        },
        client: {
          select: { id: true, companyName: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

// DELETE /api/tasks - Delete a task
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    await db.task.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
