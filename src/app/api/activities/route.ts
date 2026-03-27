import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbidViewerWrites } from '@/lib/rbac'

// GET /api/activities - Get activities
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')
    const clientId = searchParams.get('clientId')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (leadId) where.leadId = leadId
    if (clientId) where.clientId = clientId
    if (userId) where.userId = userId

    const activities = await db.activity.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, firstName: true, lastName: true, company: true } },
        client: { select: { id: true, companyName: true } }
      }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

// POST /api/activities - Create a new activity
export async function POST(request: Request) {
  try {
    const forbidden = await forbidViewerWrites()
    if (forbidden) return forbidden

    const data = await request.json()
    
    const activity = await db.activity.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description || null,
        duration: data.duration || null,
        leadId: data.leadId || null,
        clientId: data.clientId || null,
        userId: data.userId || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}
