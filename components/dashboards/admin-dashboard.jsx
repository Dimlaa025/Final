"use client"

import { useEffect, useState } from "react"
import { getClaims, getMembers, getAuditLogs, STORAGE_KEYS, getNotifications } from "@/lib/storage"
import { canViewAuditLogs, canManageUsers, canManageMembers, canViewAllClaims, canApproveClaims, canViewAnalytics } from "@/lib/permissions"
import { Users, AlertTriangle, CheckCircle, Clock, Activity, BarChart3, UserCheck, FileText, Settings } from "lucide-react"
import AnalyticsDashboard from "./analytics-dashboard"
import {
  getMCBAnalytics,
  getMonthlyClaimsTrend,
  getClaimsByDepartment,
  getClaimsByType,
  getClaimsByDependentRelationship,
  getMemberVsDependentClaims,
  getTopClaimants,
  getClaimsByProcedure, // Added
  getClaimsByDiagnosis  // Added
} from "@/lib/storage"

// Reusable Dashboard Card Component
function DashboardCard({ title, value, icon: Icon, color = "blue", permission = true }) {
  if (!permission) return null

  const colorClasses = {
    blue: "bg-white border-gray-200 text-gray-700",
    green: "bg-white border-gray-200 text-gray-700",
    red: "bg-white border-gray-200 text-gray-700",
    yellow: "bg-white border-gray-200 text-gray-700",
    orange: "bg-white border-gray-200 text-gray-700",
    purple: "bg-white border-gray-200 text-gray-700",
    indigo: "bg-white border-gray-200 text-gray-700"
  }

  return (
    <div className={`rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4 lg:p-6 border min-h-[72px] sm:min-h-[80px] lg:min-h-[96px] ${colorClasses[color]}`}>
      <div className="flex items-center justify-between h-full">
        <div className="flex-1">
          <p className="text-xs font-medium opacity-80 leading-tight">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 opacity-80 flex-shrink-0 ml-2" />
      </div>
    </div>
  )
}

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMembers: 0,
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    voidedClaims: 0,
    totalAuditLogs: 0,
    unreadNotifications: 0,
  })

  const [showAnalytics, setShowAnalytics] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [dateRange, setDateRange] = useState(30)

  useEffect(() => {
    const loadStats = () => {
      const users = canManageUsers(user) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]") : []
      const members = canManageMembers(user) ? getMembers() : []
      const claims = canViewAllClaims(user) ? getClaims() : []
      const auditLogs = canViewAuditLogs(user) ? getAuditLogs() : []
      const notifications = getNotifications(user.id)

      const pendingClaims = claims.filter((c) => c.status === "submitted" || c.status === "pending-approval")
      const approvedClaims = claims.filter((c) => c.status === "approved")
      const rejectedClaims = claims.filter((c) => c.status === "rejected")
      const voidedClaims = claims.filter((c) => c.status === "voided")
      const unreadNotifications = notifications.filter((n) => !n.read).length

      setStats({
        totalUsers: users.length,
        totalMembers: members.length,
        totalClaims: claims.length,
        pendingClaims: pendingClaims.length,
        approvedClaims: approvedClaims.length,
        rejectedClaims: rejectedClaims.length,
        voidedClaims: voidedClaims.length,
        totalAuditLogs: auditLogs.length,
        unreadNotifications,
      })
    }

    loadStats()

    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('we_care_')) {
        loadStats()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [user])

  useEffect(() => {
    if (showAnalytics && canViewAnalytics(user)) {
      loadAnalyticsData()
    }
  }, [showAnalytics, user, dateRange])

  const loadAnalyticsData = () => {
    try {
      const data = {
        mcbAnalytics: getMCBAnalytics(user, dateRange),
        monthlyTrend: getMonthlyClaimsTrend(user),
        departmentData: getClaimsByDepartment(user),
        typeData: getClaimsByType(user),
        relationshipData: getClaimsByDependentRelationship(user),
        memberVsDependent: getMemberVsDependentClaims(user),
        topClaimants: getTopClaimants(user, 10),
        // ✅ Added these two lines so the Admin dashboard populates all charts
        procedureData: getClaimsByProcedure(user),
        diagnosisData: getClaimsByDiagnosis(user),
      }
      setAnalyticsData(data)
    } catch (error) {
      console.error("Error loading analytics data:", error)
    }
  }

  if (showAnalytics) {
    return (
      <AnalyticsDashboard 
        user={user} 
        analyticsData={analyticsData} 
        dateRange={dateRange} 
        setDateRange={setDateRange} 
        onBack={() => setShowAnalytics(false)} 
      />
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Analytics Toggle */}
      {canViewAnalytics(user) && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </button>
        </div>
      )}

      {/* User Overview Section */}
      {(canManageUsers(user) || canManageMembers(user)) && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">User Overview</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <DashboardCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              color="blue"
              permission={canManageUsers(user)}
            />
            <DashboardCard
              title="Total Members"
              value={stats.totalMembers}
              icon={UserCheck}
              color="purple"
              permission={canManageMembers(user)}
            />
          </div>
        </div>
      )}

      {/* Claims Overview Section */}
      {canViewAllClaims(user) && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Claims Overview</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <DashboardCard title="Pending" value={stats.pendingClaims} icon={Clock} color="yellow" permission={canViewAllClaims(user)} />
            <DashboardCard title="Approved" value={stats.approvedClaims} icon={CheckCircle} color="green" permission={canViewAllClaims(user)} />
            <DashboardCard title="Rejected" value={stats.rejectedClaims} icon={AlertTriangle} color="red" permission={canApproveClaims(user)} />
            <DashboardCard title="Voided" value={stats.voidedClaims} icon={AlertTriangle} color="orange" permission={canApproveClaims(user)} />
          </div>
        </div>
      )}

      {/* System Activity Section */}
      {canViewAuditLogs(user) && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">System Activity</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-xs sm:max-w-none">
            <DashboardCard
              title="Audit Logs"
              value={stats.totalAuditLogs}
              icon={Activity}
              color="indigo"
              permission={canViewAuditLogs(user)}
            />
          </div>
        </div>
      )}
    </div>
  )
}