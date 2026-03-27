import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/dashboard - Get dashboard metrics
export async function GET() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    // Get total leads count
    const totalLeads = await db.lead.count()

    // Get active deals count
    const activeDeals = await db.deal.count({
      where: { status: 'OPEN' }
    })

    // Get revenue MTD (sum of won deals this month)
    const wonDealsThisMonth = await db.deal.aggregate({
      where: {
        status: 'WON',
        updatedAt: { gte: startOfMonth }
      },
      _sum: { value: true }
    })
    const revenueMTD = wonDealsThisMonth._sum.value || 0

    // Get tasks due today
    const tasksDueToday = await db.task.count({
      where: {
        dueDate: { gte: now, lte: endOfToday },
        status: { not: 'COMPLETED' }
      }
    })

    // Get leads by status
    const leadsByStatus = await db.lead.groupBy({
      by: ['status'],
      _count: { id: true }
    })

    // Get leads by source
    const leadsBySource = await db.lead.groupBy({
      by: ['source'],
      _count: { id: true }
    })

    // Get deals by stage
    const stages = await db.pipelineStage.findMany({
      orderBy: { order: 'asc' }
    })
    
    const dealsByStage = await Promise.all(
      stages.map(async (stage) => {
        const count = await db.deal.count({
          where: { stageId: stage.id, status: 'OPEN' }
        })
        const value = await db.deal.aggregate({
          where: { stageId: stage.id, status: 'OPEN' },
          _sum: { value: true }
        })
        return {
          stage: stage.name,
          count,
          value: value._sum.value || 0
        }
      })
    )

    // Get monthly revenue for the last 6 months
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthDeals = await db.deal.aggregate({
        where: {
          status: 'WON',
          updatedAt: { gte: monthStart, lte: monthEnd }
        },
        _sum: { value: true }
      })
      
      monthlyRevenue.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthDeals._sum.value || 0
      })
    }

    // Get recent activities
    const recentActivities = await db.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, firstName: true, lastName: true, company: true } },
        client: { select: { id: true, companyName: true } }
      }
    })

    // Get tasks due
    const tasksDue = await db.task.findMany({
      where: {
        dueDate: { gte: now },
        status: { not: 'COMPLETED' }
      },
      take: 5,
      orderBy: { dueDate: 'asc' },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, firstName: true, lastName: true } },
        client: { select: { id: true, companyName: true } }
      }
    })

    return NextResponse.json({
      totalLeads,
      activeDeals,
      revenueMTD,
      tasksDueToday,
      leadsByStatus: leadsByStatus.map(l => ({ status: l.status, count: l._count.id })),
      leadsBySource: leadsBySource.filter(l => l.source).map(l => ({ source: l.source, count: l._count.id })),
      dealsByStage,
      monthlyRevenue,
      recentActivities,
      tasksDue
    })
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard metrics' }, { status: 500 })
  }
}
