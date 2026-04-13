"use client"

import { useEffect, useState } from "react"
import {
  getMCBAnalytics,
  getMonthlyClaimsTrend,
  getClaimsByDepartment,
  getClaimsByProcedure,
  getClaimsByDiagnosis,
  getClaimsByType,
  getClaimsByDependentRelationship,
  getMemberVsDependentClaims,
  getTopClaimants,
} from "@/lib/storage"
import { canViewAnalytics } from "@/lib/permissions"
import {
  TrendingUp,
  Users,
  BarChart3,
  Filter,
  PieChart as PieChartIcon,
} from "lucide-react"
import {
  Bar,
  BarChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell,
  Legend,
  Tooltip,
} from "recharts"

const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
]

export default function AnalyticsDashboard({
  user,
  analyticsData: propAnalyticsData,
  dateRange: propDateRange,
  setDateRange: propSetDateRange,
  showExportButton = true,
  onBack,
}) {
  const [analyticsData, setAnalyticsData] = useState(propAnalyticsData || null)
  const [dateRange, setDateRange] = useState(propDateRange || 30)
  const [loading, setLoading] = useState(!propAnalyticsData)

  const currentDateRange = propDateRange !== undefined ? propDateRange : dateRange
  const currentSetDateRange = propSetDateRange || setDateRange

  useEffect(() => {
    if (!user) return

    if (propAnalyticsData) {
      setAnalyticsData(propAnalyticsData)
      setLoading(false)
      return
    }

    if (canViewAnalytics(user)) {
      loadAnalyticsData()
    }
  }, [user, currentDateRange, propAnalyticsData])

  const loadAnalyticsData = () => {
    if (!user) return

    setLoading(true)
    try {
      const data = {
        mcbAnalytics: getMCBAnalytics(user, currentDateRange),
        monthlyTrend: getMonthlyClaimsTrend(user),
        departmentData: getClaimsByDepartment(user),
        procedureData: getClaimsByProcedure(user),
        diagnosisData: getClaimsByDiagnosis(user),
        typeData: getClaimsByType(user),
        relationshipData: getClaimsByDependentRelationship(user),
        memberVsDependent: getMemberVsDependentClaims(user),
        topClaimants: getTopClaimants(user, 10),
      }

      setAnalyticsData(data)
    } catch (error) {
      console.error("Error loading analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) =>
    `₱${parseFloat(amount || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const isEmptyData = (data) => !data || data.length === 0

  const renderEmptyState = (IconComponent, title, subtitle) => (
    <div className="flex flex-col items-center justify-center h-64 py-8 text-center">
      <IconComponent className="w-12 h-12 text-gray-400 mb-4" />
      <h4 className="text-lg font-medium text-gray-900 mb-1">{title}</h4>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  )

  if (!user) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (!canViewAnalytics(user)) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Access Required</h3>
          <p className="text-gray-600">You don&apos;t have permission to view analytics data.</p>
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

  const memberVsDependentChartData = [
    {
      category: "Claims",
      member: analyticsData.memberVsDependent?.member?.count || 0,
      dependent: analyticsData.memberVsDependent?.dependent?.count || 0,
    },
  ]

  const noMemberDependentData =
    (analyticsData.memberVsDependent?.member?.count || 0) === 0 &&
    (analyticsData.memberVsDependent?.dependent?.count || 0) === 0

  const handleExportAnalytics = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Popup blocked. Please allow popups first.")
      return
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Analytics Report - ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #111827; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .section { margin-bottom: 30px; }
          .metric { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
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
            <p><strong>Total Claimed:</strong> ${formatCurrency(analyticsData.mcbAnalytics.totalClaimed)}</p>
            <p><strong>MCB Limit:</strong> ${formatCurrency(analyticsData.mcbAnalytics.mcbLimit)}</p>
            <p><strong>Remaining:</strong> ${formatCurrency(analyticsData.mcbAnalytics.remaining)}</p>
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
              ${analyticsData.monthlyTrend.slice(-6).map((month) => `
                <tr>
                  <td>${month.month}</td>
                  <td>${month.submitted}</td>
                  <td>${month.approved}</td>
                </tr>
              `).join("")}
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
                ${analyticsData.departmentData.slice(0, 5).map((dept) => `
                  <tr>
                    <td>${dept.department}</td>
                    <td>${dept.count}</td>
                    <td>${formatCurrency(dept.totalAmount)}</td>
                  </tr>
                `).join("")}
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
                ${analyticsData.typeData.map((type) => `
                  <tr>
                    <td>${type.type}</td>
                    <td>${type.count}</td>
                    <td>${type.percentage.toFixed(1)}%</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <div class="section">
          <h2>Claims by Relationship</h2>
          <table>
            <thead>
              <tr><th>Relationship</th><th>Count</th><th>Percentage</th></tr>
            </thead>
            <tbody>
              ${analyticsData.relationshipData.map((rel) => `
                <tr>
                  <td>${rel.relationship}</td>
                  <td>${rel.count}</td>
                  <td>${rel.percentage.toFixed(1)}%</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Member vs Dependent Claims</h2>
          <div class="grid">
            <div class="metric">
              <h3>Member Claims</h3>
              <p><strong>Count:</strong> ${analyticsData.memberVsDependent.member.count}</p>
              <p><strong>Total Amount:</strong> ${formatCurrency(analyticsData.memberVsDependent.member.totalAmount)}</p>
            </div>
            <div class="metric">
              <h3>Dependent Claims</h3>
              <p><strong>Count:</strong> ${analyticsData.memberVsDependent.dependent.count}</p>
              <p><strong>Total Amount:</strong> ${formatCurrency(analyticsData.memberVsDependent.dependent.totalAmount)}</p>
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
                  <td>${formatCurrency(claimant.totalAmount)}</td>
                  <td>${claimant.claimCount}</td>
                </tr>
              `).join("")}
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
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  return (
    <div className="p-6 space-y-6">
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Data Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Comprehensive insights into claims and member data
          </p>
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
              onClick={handleExportAnalytics}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Analytics
            </button>
          )}
        </div>
      </div>

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
                  style={{
                    width: `${Math.min(analyticsData.mcbAnalytics.utilizationRate, 100)}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {analyticsData.mcbAnalytics.utilizationRate.toFixed(1)}% utilized
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Monthly Claims Trend</h3>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>

          {isEmptyData(analyticsData.monthlyTrend?.slice(-6)) ? (
            renderEmptyState(BarChart3, "No trend data available", "Claims data will appear here when available")
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.monthlyTrend.slice(-6)}>
                <Tooltip />
                <Legend />
                <XAxis dataKey="month" />
                <YAxis />
                <Bar dataKey="submitted" name="Submitted" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="approved" name="Approved" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Claims by Department</h3>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>

          {isEmptyData(analyticsData.departmentData?.slice(0, 5)) ? (
            renderEmptyState(BarChart3, "No department data", "Department claims will appear here")
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={analyticsData.departmentData.slice(0, 5)}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
              >
                <Tooltip />
                <XAxis type="number" />
                <YAxis type="category" dataKey="department" width={90} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {analyticsData.departmentData.slice(0, 5).map((entry, index) => (
                    <Cell key={`dept-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Claims by Procedure</h3>
            <PieChartIcon className="w-5 h-5 text-orange-500" />
          </div>

          {isEmptyData(analyticsData.procedureData) ? (
            renderEmptyState(PieChartIcon, "No procedure data", "Procedures will appear here")
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={analyticsData.procedureData}
                  dataKey="count"
                  nameKey="procedure"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {analyticsData.procedureData.map((entry, index) => (
                    <Cell key={`procedure-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Claims by Diagnosis</h3>
            <PieChartIcon className="w-5 h-5 text-red-500" />
          </div>

          {isEmptyData(analyticsData.diagnosisData) ? (
            renderEmptyState(PieChartIcon, "No diagnosis data", "Diagnoses will appear here")
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={analyticsData.diagnosisData}
                  dataKey="count"
                  nameKey="diagnosis"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {analyticsData.diagnosisData.map((entry, index) => (
                    <Cell key={`diagnosis-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Claims by Type</h3>
            <PieChartIcon className="w-5 h-5 text-cyan-500" />
          </div>

          {isEmptyData(analyticsData.typeData) ? (
            renderEmptyState(PieChartIcon, "No type data", "Claim types will appear here")
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={analyticsData.typeData}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {analyticsData.typeData.map((entry, index) => (
                    <Cell key={`type-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Claims by Relationship</h3>
            <Users className="w-5 h-5 text-pink-500" />
          </div>

          {isEmptyData(analyticsData.relationshipData?.slice(0, 5)) ? (
            renderEmptyState(PieChartIcon, "No relationship data", "Relationship claims will appear here")
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={analyticsData.relationshipData.slice(0, 5)}
                  dataKey="count"
                  nameKey="relationship"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {analyticsData.relationshipData.slice(0, 5).map((entry, index) => (
                    <Cell key={`relationship-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Member vs Dependent Claims</h3>
          <BarChart3 className="w-5 h-5 text-indigo-500" />
        </div>

        {noMemberDependentData ? (
          renderEmptyState(BarChart3, "No member/dependent data", "Member and dependent claims will appear here")
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memberVsDependentChartData}>
              <Tooltip />
              <Legend />
              <XAxis dataKey="category" />
              <YAxis />
              <Bar dataKey="member" name="Member Claims" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="dependent" name="Dependent Claims" fill="#EC4899" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Claimants</h3>
          <Users className="w-5 h-5 text-yellow-500" />
        </div>

        <div className="space-y-3">
          {analyticsData.topClaimants.slice(0, 5).map((claimant, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-900">{claimant.name}</span>
              </div>

              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(claimant.totalAmount)}
                </span>
                <p className="text-xs text-gray-500">{claimant.claimCount} claims</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}