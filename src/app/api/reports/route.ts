import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/reports - Get report data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Sales Summary
    const totalDeals = await db.deal.count({ where: dateFilter })
    const wonDeals = await db.deal.count({ 
      where: { ...dateFilter, status: 'WON' } 
    })
    const lostDeals = await db.deal.count({ 
      where: { ...dateFilter, status: 'LOST' } 
    })
    
    const totalValueResult = await db.deal.aggregate({
      where: dateFilter,
      _sum: { value: true }
    })
    const wonValueResult = await db.deal.aggregate({
      where: { ...dateFilter, status: 'WON' },
      _sum: { value: true }
    })

    const conversionRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0

    // Revenue by Month (last 12 months)
    const now = new Date()
    const revenueByMonth = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthDeals = await db.deal.aggregate({
        where: {
          status: 'WON',
          updatedAt: { gte: monthStart, lte: monthEnd }
        },
        _sum: { value: true }
      })
      
      revenueByMonth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: monthDeals._sum.value || 0
      })
    }

    // Lead Source Analysis
    const leadSources = await db.lead.groupBy({
      by: ['source'],
      where: { source: { not: null } },
      _count: { id: true }
    })

    const leadSourceAnalysis = await Promise.all(
      leadSources.map(async (source) => {
        const leadsFromSource = await db.lead.findMany({
          where: { source: source.source },
          select: { id: true }
        })
        
        const leadIds = leadsFromSource.map(l => l.id)
        const valueResult = await db.deal.aggregate({
          where: { 
            leadId: { in: leadIds },
            status: 'WON'
          },
          _sum: { value: true }
        })
        
        return {
          source: source.source || 'Unknown',
          count: source._count.id,
          value: valueResult._sum.value || 0
        }
      })
    )

    // Team Performance
    const users = await db.user.findMany({
      where: { role: { in: ['AGENT', 'MANAGER'] } },
      select: { id: true, name: true }
    })

    const teamPerformance = await Promise.all(
      users.map(async (user) => {
        const dealsCount = await db.deal.count({
          where: { assignedToId: user.id, ...dateFilter }
        })
        const revenueResult = await db.deal.aggregate({
          where: { 
            assignedToId: user.id, 
            status: 'WON',
            ...dateFilter 
          },
          _sum: { value: true }
        })
        const leadsCount = await db.lead.count({
          where: { assignedToId: user.id, ...dateFilter }
        })
        
        return {
          userId: user.id,
          userName: user.name,
          deals: dealsCount,
          revenue: revenueResult._sum.value || 0,
          leads: leadsCount
        }
      })
    )

    // Pipeline Health
    const stages = await db.pipelineStage.findMany({
      orderBy: { order: 'asc' }
    })
    
    const pipelineHealth = await Promise.all(
      stages.map(async (stage) => {
        const count = await db.deal.count({
          where: { stageId: stage.id, status: 'OPEN' }
        })
        const valueResult = await db.deal.aggregate({
          where: { stageId: stage.id, status: 'OPEN' },
          _sum: { value: true }
        })
        
        return {
          stage: stage.name,
          count,
          value: valueResult._sum.value || 0,
          color: stage.color
        }
      })
    )

    return NextResponse.json({
      salesSummary: {
        totalDeals,
        wonDeals,
        lostDeals,
        conversionRate,
        totalValue: totalValueResult._sum.value || 0,
        wonValue: wonValueResult._sum.value || 0
      },
      revenueByMonth,
      leadSourceAnalysis,
      teamPerformance,
      pipelineHealth
    })
  } catch (error) {
    console.error('Error fetching report data:', error)
    return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 })
  }
}
