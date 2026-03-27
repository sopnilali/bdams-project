'use client'

import { useEffect, useState } from 'react'
import { ReportData } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartSkeleton, MetricCardSkeleton } from '@/components/shared/Skeletons'
import { Download, FileText, TrendingUp, TrendingDown, DollarSign, Users, BarChart2, PieChart } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format, subMonths, subDays } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b', '#ec4899', '#14b8a6']

export function ReportsTab() {
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 12))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  useEffect(() => {
    fetchReportData()
  }, [startDate, endDate])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('startDate', startDate.toISOString())
      params.append('endDate', endDate.toISOString())

      const res = await fetch(`/api/reports?${params.toString()}`)
      const data = await res.json()
      setReportData(data)
    } catch (error) {
      console.error('Error fetching report data:', error)
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

  const handleExport = (type: 'pdf' | 'excel') => {
    // Mock export functionality
    alert(`Export to ${type.toUpperCase()} would be implemented here`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
          <p className="text-slate-500">View performance metrics and reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-48">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Start Date</p>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">End Date</p>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </div>
                <Button onClick={() => setDatePickerOpen(false)}>Apply</Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <FileText className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-500">Total Deals</span>
            </div>
            <p className="text-2xl font-bold">{reportData?.salesSummary.totalDeals || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-slate-500">Won Deals</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{reportData?.salesSummary.wonDeals || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm text-slate-500">Lost Deals</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{reportData?.salesSummary.lostDeals || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-slate-500">Conversion</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{reportData?.salesSummary.conversionRate || 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-slate-500">Total Value</span>
            </div>
            <p className="text-xl font-bold text-amber-600">
              {formatCurrency(reportData?.salesSummary.totalValue || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-slate-500">Won Value</span>
            </div>
            <p className="text-xl font-bold text-emerald-600">
              {formatCurrency(reportData?.salesSummary.wonValue || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData?.revenueByMonth || []}>
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
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lead Source Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Lead Source Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.leadSourceAnalysis || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis dataKey="source" type="category" stroke="#64748b" fontSize={12} width={100} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'value' ? formatCurrency(value) : value, 
                      name === 'value' ? 'Revenue' : 'Leads'
                    ]}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#06b6d4" name="Leads" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="value" fill="#10b981" name="Revenue" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Pipeline Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.pipelineHealth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="stage" stroke="#64748b" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'value' ? formatCurrency(value) : value, 
                      name === 'value' ? 'Value' : 'Deals'
                    ]}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                  {(reportData?.pipelineHealth || []).map((entry, index) => (
                    <Bar 
                      key={index}
                      yAxisId="left"
                      dataKey="count" 
                      fill={entry.color} 
                      name="Deals" 
                      radius={[4, 4, 0, 0]} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Pipeline Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={reportData?.pipelineHealth || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ stage, percent }) => `${stage}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    dataKey="value"
                    nameKey="stage"
                  >
                    {(reportData?.pipelineHealth || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Deals</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Avg Deal Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData?.teamPerformance?.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="font-medium">{member.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{member.deals}</TableCell>
                  <TableCell className="text-right font-medium text-emerald-600">
                    {formatCurrency(member.revenue)}
                  </TableCell>
                  <TableCell className="text-right">{member.leads}</TableCell>
                  <TableCell className="text-right">
                    {member.deals > 0 ? formatCurrency(member.revenue / member.deals) : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {(!reportData?.teamPerformance || reportData.teamPerformance.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    No team performance data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
