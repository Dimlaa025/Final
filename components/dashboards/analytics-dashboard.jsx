"use client"

import { useEffect, useState } from "react"
import {
  getMCBAnalytics,
  getMonthlyClaimsTrend,
  getClaimsByDepartment,
  getClaimsByProcedure,
  getClaimsByDiagnosis,
  getClaimsByDependentRelationship,
  getMemberVsDependentClaims,
  getTopClaimants,
  getClaims
} from "@/lib/storage"
import { canViewAnalytics } from "@/lib/permissions"
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, Calendar, Filter } from "lucide-react"
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell,
  Legend,
  Tooltip
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'

export default function AnalyticsDashboard({ user, analyticsData: propAnalyticsData, dateRange: propDateRange, setDateRange: propSetDateRange, showExportButton = true, onBack }) {
  const [analyticsData, setAnalyticsData] = useState(propAnalyticsData || null)
  const [dateRange, setDateRange] = useState(propDateRange || 30)
  const [loading, setLoading] = useState(!propAnalyticsData)

  // Use props if provided, otherwise use local state
  const currentDateRange = propDateRange !== undefined ? propDateRange : dateRange
  const currentSetDateRange = propSetDateRange || setDateRange

  useEffect(() => {
    if (canViewAnalytics(user)) {
      loadAnalyticsData()
    }
  }, [user, dateRange])

  const loadAnalyticsData = () => {
    setLoading(true)
    try {
      const data = {
        mcbAnalytics: getMCBAnalytics(user, dateRange),
        monthlyTrend: getMonthlyClaimsTrend(user),
        departmentData: getClaimsByDepartment(user),
        procedureData: getClaimsByProcedure(user),
        diagnosisData: getClaimsByDiagnosis(user),
        relationshipData: getClaimsByDependentRelationship(user),
        memberVsDependent: getMemberVsDependentClaims(user),
        topClaimants: getTopClaimants(user, 10),
        // Remove voided claims count as they should be excluded from analytics
      }
      setAnalyticsData(data)
    } catch (error) {
      console.error("Error loading analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!canViewAnalytics(user)) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Access Required</h3>
          <p className="text-gray-600">You don't have permission to view analytics data.</p>
        </div>
      </div>
    )
  }

  if (loading || !analyticsData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount) => `₱${parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const isEmptyData = (data) => !data || data.length === 0

  return (
    <div className="p-6 space-y-6">
      {/* Back Button for Embedded View */}
      {onBack && (
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      )}

      {/* Header with Date Range Filter and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Data Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Comprehensive insights into claims and member data</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={currentDateRange}
              onChange={(e) => currentSetDateRange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
            >
              <option value={7}>Last 7 days</option>
              <option value={15}>Last 15 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
          {showExportButton && (
            <button
              onClick={() => {
                // Export analytics data as PDF
                const printWindow = window.open('', '_blank')
                const htmlContent = `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <title>Analytics Report - ${new Date().toLocaleDateString()}</title>
                    <style>
                      body { font-family: Arial, sans-serif; margin: 20px; }
                      .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                      .section { margin-bottom: 30px; }
                      .metric { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
                      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                      .chart { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
                      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                      th { background-color: #f2f2f2; }
                      .export-info { margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
                    </style>
                  </head>
                  <body>
                    <div class="header">
                      <h1>We Care Insurance - Analytics Report</h1>
                      <p>Generated on ${new Date().toLocaleString()} by ${user.name}</p>
                    <p>Date Range: Last ${currentDateRange} days</p>
                    </div>

                    <div class="section">
                      <h2>Maximum Coverage Benefit (MCB)</h2>
                      <div class="metric">
                        <p><strong>Total Claimed:</strong> ₱${analyticsData.mcbAnalytics.totalClaimed.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p><strong>MCB Limit:</strong> ₱${analyticsData.mcbAnalytics.mcbLimit.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p><strong>Remaining:</strong> ₱${analyticsData.mcbAnalytics.remaining.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p><strong>Utilization Rate:</strong> ${analyticsData.mcbAnalytics.utilizationRate.toFixed(1)}%</p>

                      </div>
                    </div>

                    <div class="section">
                      <h2>Monthly Claims Trend</h2>
                      <table>
                        <thead>
                          <tr><th>Month</th><th>Submitted</th><th>Approved</th></tr>
                        </thead>
                        <tbody>
                          ${analyticsData.monthlyTrend.slice(-6).map(month => `
                            <tr>
                              <td>${month.month}</td>
                              <td>${month.submitted}</td>
                              <td>${month.approved}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>

                    <div class="grid">
                      <div class="section">
                        <h2>Claims by Department</h2>
                        <table>
                          <thead>
                            <tr><th>Department</th><th>Count</th><th>Total Amount</th></tr>
                          </thead>
                          <tbody>
                            ${analyticsData.departmentData.slice(0, 5).map(dept => `
                              <tr>
                                <td>${dept.department}</td>
                                <td>${dept.count}</td>
                                <td>₱${dept.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>

                    <div class="section">
                      <h2>Claims by Type</h2>
                      <table>
                        <thead>
                          <tr><th>Type</th><th>Count</th><th>Percentage</th></tr>
                        </thead>
                        <tbody>
                          ${analyticsData.typeData.map(type => `
                            <tr>
                              <td>${type.type}</td>
                              <td>${type.count}</td>
                              <td>${type.percentage.toFixed(1)}%</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div class="section">
                    <h2>Member vs Dependent Claims</h2>
                    <div class="grid">
                      <div class="metric">
                        <h3>Member Claims</h3>
                        <p><strong>Count:</strong> ${analyticsData.memberVsDependent.member.count}</p>
                        <p><strong>Total Amount:</strong> ₱${analyticsData.memberVsDependent.member.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                      <div class="metric">
                        <h3>Dependent Claims</h3>
                        <p><strong>Count:</strong> ${analyticsData.memberVsDependent.dependent.count}</p>
                        <p><strong>Total Amount:</strong> ₱${analyticsData.memberVsDependent.dependent.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>

                  <div class="section">
                    <h2>Top Claimants</h2>
                    <table>
                      <thead>
                        <tr><th>Rank</th><th>Name</th><th>Total Amount</th><th>Claim Count</th></tr>
                      </thead>
                      <tbody>
                        ${analyticsData.topClaimants.slice(0, 5).map((claimant, index) => `
                          <tr>
                            <td>${index + 1}</td>
                            <td>${claimant.name}</td>
                            <td>₱${claimant.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td>${claimant.claimCount}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>

                  <div class="export-info">
                    <p>This report was automatically generated from the We Care Insurance analytics dashboard.</p>
                    <p>Export timestamp: ${new Date().toISOString()}</p>
                  </div>
                </body>
                </html>
              `

              printWindow.document.write(htmlContent)
              printWindow.document.close()

              // Wait for content to load then print
              printWindow.onload = () => {
                printWindow.print()
                printWindow.close()
              }
            }}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Analytics
          </button>
          )}
        </div>
      </div>

      {/* MCB Analytics Card */}
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border-l-4 border-blue-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-gray-600 text-sm font-medium">Maximum Coverage Benefit (MCB)</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              {formatCurrency(analyticsData.mcbAnalytics.totalClaimed)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              of {formatCurrency(analyticsData.mcbAnalytics.mcbLimit)} limit
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(analyticsData.mcbAnalytics.remaining)}
              </p>
            </div>
            <div className="mt-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(analyticsData.mcbAnalytics.utilizationRate, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {analyticsData.mcbAnalytics.utilizationRate.toFixed(1)}% utilized
              </p>
            </div>
          </div>
        </div>
      </div>



      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Claims Trend */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Monthly Claims Trend</h3>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          {isEmptyData(analyticsData.monthlyTrend?.slice(-6)) ? (
            <div className="flex flex-col items-center justify-center h-64 py-8 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-1">No trend data available</h4>
              <p className="text-gray-500 text-sm">Claims data will appear here when available</p>
            </div>
          ) : (
            <ChartContainer config={{
              submitted: { label: 'Submitted', color: 'hsl(var(--chart-1))' },
              approved: { label: 'Approved', color: 'hsl(var(--chart-2))' }
            }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.monthlyTrend.slice(-6)} accessibilityLayer>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <Bar dataKey="submitted" name="Submitted" fill="var(--color-submitted)" radius={4} />
                  <Bar dataKey="approved" name="Approved" fill="var(--color-approved)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>

        {/* Claims by Department */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Claims by Department</h3>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          {isEmptyData(analyticsData.departmentData?.slice(0, 5)) ? (
            <div className="flex flex-col items-center justify-center h-64 py-8 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-1">No department data</h4>
              <p className="text-gray-500 text-sm">Department claims will appear here</p>
            </div>
          ) : (
            <ChartContainer config={analyticsData.departmentData.slice(0, 5).reduce((acc, dept) => {
              acc[dept.department] = { label: dept.department, color: `hsl(${Math.random() * 360}, 70%, 50%)` }
              return acc
            }, {})}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="horizontal" data={analyticsData.departmentData.slice(0, 5)} accessibilityLayer>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="department" fill="var(--color)" radius={4} />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis dataKey="count" type="category" tickLine={false} axisLine={false} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>

        {/* Claims by Procedure */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Claims by Procedure</h3>
            <PieChart className="w-5 h-5 text-orange-500" />
          </div>
          {isEmptyData(analyticsData.procedureData) ? (
            <div className="flex flex-col items-center justify-center h-64 py-8 text-center">
              <PieChart className="w-12 h-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-1">No procedure data</h4>
              <p className="text-gray-500 text-sm">Procedures will appear here</p>
            </div>
          ) : (
            <ChartContainer config={analyticsData.procedureData.reduce((acc, proc) => {
              acc[proc.procedure] = { label: proc.procedure, color: `hsl(${Math.random() * 360}, 70%, 50%)` }
              return acc
            }, {})}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={analyticsData.procedureData} dataKey="count" nameKey="procedure" cx="50%" cy="50%" outerRadius={80} >
                    {analyticsData.procedureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`var(--color-${entry.procedure})`} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>

        {/* Claims by Diagnosis */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Claims by Diagnosis</h3>
            <PieChart className="w-5 h-5 text-orange-500" />
          </div>
          {isEmptyData(analyticsData.diagnosisData) ? (
            <div className="flex flex-col items-center justify-center h-64 py-8 text-center">
              <PieChart className="w-12 h-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-1">No diagnosis data</h4>
              <p className="text-gray-500 text-sm">Diagnoses will appear here</p>
            </div>
          ) : (
            <ChartContainer config={analyticsData.diagnosisData.reduce((acc, diag) => {
              acc[diag.diagnosis] = { label: diag.diagnosis, color: `hsl(${Math.random() * 360}, 70%, 50%)` }
              return acc
            }, {})}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={analyticsData.diagnosisData} dataKey="count" nameKey="diagnosis" cx="50%" cy="50%" outerRadius={80} >
                    {analyticsData.diagnosisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`var(--color-${entry.diagnosis})`} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>

        {/* Claims by Dependent Relationship */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Claims by Relationship</h3>
            <Users className="w-5 h-5 text-pink-500" />
          </div>
          {isEmptyData(analyticsData.relationshipData?.slice(0, 5)) ? (
            <div className="flex flex-col items-center justify-center h-64 py-8 text-center">
              <PieChart className="w-12 h-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-1">No relationship data</h4>
              <p className="text-gray-500 text-sm">Relationship claims will appear here</p>
            </div>
          ) : (
            <ChartContainer config={analyticsData.relationshipData.slice(0, 5).reduce((acc, rel) => {
              acc[rel.relationship] = { label: rel.relationship, color: `hsl(${Math.random() * 360}, 70%, 50%)` }
              return acc
            }, {})}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={analyticsData.relationshipData.slice(0, 5)} dataKey="count" nameKey="relationship" cx="50%" cy="50%" outerRadius={80}>
                    {analyticsData.relationshipData.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`var(--color-${entry.relationship})`} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </div>

      {/* Member vs Dependent Claims */}
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Member vs Dependent Claims</h3>
          <BarChart3 className="w-5 h-5 text-indigo-500" />
        </div>
        <ChartContainer config={{
          member: { label: 'Member', color: 'hsl(var(--chart-1))' },
          dependent: { label: 'Dependent', color: 'hsl(var(--chart-2))' }
        }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart dataKey="count" layout="horizontal" accessibilityLayer>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="member" name="Member Claims" fill="var(--color-member)" radius={4} />
              <Bar dataKey="dependent" name="Dependent Claims" fill="var(--color-dependent)" radius={4} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="category" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Top Claimants */}
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Claimants</h3>
          <Users className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="space-y-3">
          {analyticsData.topClaimants.slice(0, 5).map((claimant, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-900">{claimant.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">{formatCurrency(claimant.totalAmount)}</span>
                <p className="text-xs text-gray-500">{claimant.claimCount} claims</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
