"use client"

import { useEffect, useState } from "react"
import { getPendingClaims, getClaims, getMembers, getAuditLogs, getNotifications } from "@/lib/storage"
import { canApproveClaims, canViewReports, canViewAnalytics, canViewAuditLogs, canManageMembers } from "@/lib/permissions"
import Link from "next/link"
import { AlertTriangle, CheckCircle, Clock, Activity, BarChart3, UserCheck, FileText, Settings } from "lucide-react"
import AnalyticsDashboard from "./analytics-dashboard"

// Reusable Dashboard Card Component
function DashboardCard({ title, value, icon: Icon, color = "blue", permission = true, href }) {
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

  const CardContent = () => (
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

  if (href) {
    return (
      <Link href={href}>
        <CardContent />
      </Link>
    )
  }

  return <CardContent />
}

export default function DirectorDashboard({ user }) {
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    voidedClaims: 0,
    totalAuditLogs: 0,
    unreadNotifications: 0,
  })

  const [showAnalytics, setShowAnalytics] = useState(false)

  useEffect(() => {
    const loadStats = () => {
      const members = canManageMembers(user) ? getMembers() : []
      const pendingClaims = canApproveClaims(user) ? getPendingClaims() : []
      const allClaims = canViewReports(user) ? getClaims() : []
      const approvedClaims = allClaims.filter((c) => c.status === "approved")
      const rejectedClaims = allClaims.filter((c) => c.status === "rejected")
      const voidedClaims = allClaims.filter((c) => c.status === "voided")
      const auditLogs = canViewAuditLogs(user) ? getAuditLogs() : []
      const notifications = getNotifications(user.id)

      const unreadNotifications = notifications.filter((n) => !n.read).length

      setStats({
        totalMembers: members.length,
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

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [user])

  if (showAnalytics) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setShowAnalytics(false)}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
        <AnalyticsDashboard user={user} />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

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

      {/* User Overview */}
      {canManageMembers(user) && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">User Overview</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
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

      {/* Claims Overview */}
      {canViewReports(user) && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Claims Overview</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <DashboardCard title="Pending Claims" value={stats.pendingClaims} icon={Clock} color="yellow" permission={canApproveClaims(user)} href="/dashboard/approvals" />
            <DashboardCard title="Approved Claims" value={stats.approvedClaims} icon={CheckCircle} color="green" permission={canViewReports(user)} />
            <DashboardCard title="Rejected Claims" value={stats.rejectedClaims} icon={AlertTriangle} color="red" permission={canApproveClaims(user)} />
            <DashboardCard title="Voided Claims" value={stats.voidedClaims} icon={AlertTriangle} color="orange" permission={canApproveClaims(user)} />
          </div>
        </div>
      )}

      {/* System Activity */}
      {canViewAuditLogs(user) && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">System Activity</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-xs sm:max-w-none">
            <DashboardCard title="Audit Logs" value={stats.totalAuditLogs} icon={Activity} color="indigo" permission={canViewAuditLogs(user)} />
          </div>
        </div>
      )}

    </div>
  )
}