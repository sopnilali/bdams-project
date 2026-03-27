'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { DashboardMetrics } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MetricCardSkeleton, ChartSkeleton } from '@/components/shared/Skeletons'
import { Users, DollarSign, TrendingUp, CheckSquare, Plus, Phone, Mail, Calendar, FileText, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import { format } from 'date-fns'
import { ActivityTypeBadge, TaskStatusBadge } from '@/components/shared/StatusBadges'

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b']

export function DashboardTab() {
  const { 
    setActiveTab, 
    setLeadModalOpen, 
    setDealModalOpen, 
    setTaskModalOpen,
    pipelineStages,
    setPipelineStages,
    setUsers,
    setCurrentUser,
    currentUser,
  } = useAppStore()
  
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard metrics
      const metricsRes = await fetch('/api/dashboard')
      const metricsData = await metricsRes.json()
      setMetrics(metricsData)
      
      // Fetch pipeline stages
      const stagesRes = await fetch('/api/pipeline-stages')
      const stagesData = await stagesRes.json()
      setPipelineStages(stagesData)
      
      // Fetch users
      const usersRes = await fetch('/api/users')
      const usersData = await usersRes.json()
      if (!usersRes.ok) {
        throw new Error(
          typeof usersData?.error === 'string' ? usersData.error : 'Failed to fetch users'
        )
      }

      const usersList = Array.isArray(usersData)
        ? usersData
        : Array.isArray(usersData?.users)
          ? usersData.users
          : []

      setUsers(usersList)
      
      // Do not auto-select a "demo user" here.
      // Logged-in user is sourced from NextAuth session (see `src/app/providers.tsx`).
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CALL': return <Phone className="w-4 h-4" />
      case 'EMAIL': return <Mail className="w-4 h-4" />
      case 'MEETING': return <Calendar className="w-4 h-4" />
      case 'NOTE': return <FileText className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Leads</p>
                <p className="text-3xl font-bold text-slate-800">{metrics?.totalLeads || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Deals</p>
                <p className="text-3xl font-bold text-slate-800">{metrics?.activeDeals || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Revenue (MTD)</p>
                <p className="text-3xl font-bold text-slate-800">
                  {formatCurrency(metrics?.revenueMTD || 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Tasks Due Today</p>
                <p className="text-3xl font-bold text-slate-800">{metrics?.tasksDueToday || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics?.monthlyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Leads by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics?.leadsBySource || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ source, percent }) => `${source}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="source"
                  >
                    {(metrics?.leadsBySource || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Pipeline by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.dealsByStage || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                  formatter={(value: number, name: string) => [
                    name === 'value' ? formatCurrency(value) : value, 
                    name === 'value' ? 'Value' : 'Count'
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#06b6d4" name="Deals" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="value" fill="#10b981" name="Value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('leads')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {metrics?.recentActivities?.length ? (
                metrics.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-slate-800 truncate">{activity.title}</p>
                        <ActivityTypeBadge type={activity.type} />
                      </div>
                      <p className="text-sm text-slate-500 truncate">
                        {activity.lead?.company || activity.client?.companyName || 'General'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasks Due */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Upcoming Tasks</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('tasks')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {metrics?.tasksDue?.length ? (
                metrics.tasksDue.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <TaskStatusBadge status={task.status} />
                        <span className="text-sm text-slate-500">
                          Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 truncate max-w-24">
                        {task.assignedTo?.name || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">No upcoming tasks</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
