"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getClaims, getMembers, getAuditLogs } from "@/lib/storage"
import { canViewReports, canExportReports, canViewAuditLogs, canManageUsers, canViewOwnClaims } from "@/lib/permissions"
import { Download } from "lucide-react"
import AuthGuard from "@/components/auth-guard"
import { generatePDFContent, downloadAsText, generatePDFHTML } from "@/lib/pdf-export"
import SummaryReport from "@/components/reports/summary-report"
import ClaimsReport from "@/components/reports/claims-report"
import UsersReport from "@/components/reports/users-report"
import DepartmentReport from "@/components/reports/department-report"
import AuditReport from "@/components/reports/audit-report"

function ReportsContent() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [activeReport, setActiveReport] = useState("summary")
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  const getAvailableReports = () => {
    const reports = []

    if (canViewReports(user)) {
      reports.push("summary", "claims")
    }

    if (canManageUsers(user)) {
      reports.push("users")
    }

    if (canViewReports(user)) {
      reports.push("department")
    }

    if (canViewAuditLogs(user)) {
      reports.push("audit")
    }

    if (canViewOwnClaims(user)) {
      reports.push("personal")
    }

    return reports
  }

  const reportLabels = {
    summary: "Summary Report",
    claims: "Claims Report",
    users: "Users Report",
    department: "Department Report",
    audit: "Audit Report",
    members: "Members Report",
    personal: "Personal Claim Summary",
  }

  const handleExportReport = async () => {
    setExporting(true)
    try {
      let reportData = {}
      const timestamp = new Date().toISOString().split("T")[0]

      // Log report generation
      const currentUser = getCurrentUser()
      if (currentUser) {
        addAuditLog("REPORT_GENERATED", `Report "${reportLabels[activeReport] || activeReport}" generated and exported by ${currentUser.name} - Format: PDF, Date: ${timestamp}`, currentUser.id)
      }

      switch (activeReport) {
        case "summary": {
          const claims = getClaims()
          const approved = claims.filter((c) => c.status === "approved")
          const rejected = claims.filter((c) => c.status === "rejected")
          const pending = claims.filter((c) => c.status === "submitted" || c.status === "pending-approval")
          const totalAmount = claims.reduce((sum, c) => sum + Number.parseFloat(c.amount || 0), 0)
          const approvalRate = claims.length > 0 ? (approved.length / claims.length) * 100 : 0

          reportData = {
            totalClaims: claims.length,
            approvedClaims: approved.length,
            rejectedClaims: rejected.length,
            pendingClaims: pending.length,
            totalAmount,
            approvalRate,
          }
          break
        }
        case "claims": {
          const allClaims = getClaims()
          const members = getMembers()
          reportData = { claims: allClaims, members }
          break
        }
        case "users": {
          const users = JSON.parse(localStorage.getItem("we-care-users") || "[]")
          reportData = { users }
          break
        }
        case "department": {
          // This would need to be implemented based on your department data structure
          reportData = { departments: [] }
          break
        }
        case "audit": {
          const logs = getAuditLogs()
          reportData = { logs }
          break
        }
        default:
          reportData = {}
      }

      // Generate PDF content and open in new window for printing
      const htmlContent = generatePDFHTML(activeReport, reportData, user)
      const printWindow = window.open('', '_blank')
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setExporting(false)
    }
  }

  const renderReport = () => {
    switch (activeReport) {
      case "summary":
        return <SummaryReport user={user} />
      case "claims":
        return <ClaimsReport user={user} />
      case "users":
        return <UsersReport user={user} />
      case "department":
        return <DepartmentReport user={user} />
      case "audit":
        return <AuditReport user={user} />
      case "members":
        return <ClaimsReport user={user} />
      case "personal":
        return <SummaryReport user={user} personal={true} />
      default:
        return <SummaryReport user={user} />
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  const availableReports = getAvailableReports()
  const canExport = canExportReports(user)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">Reports & Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2 break-words">View and export system reports</p>
        </div>
        {canExport && (
          <button
            onClick={handleExportReport}
            disabled={exporting}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto"
          >
            <Download className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{exporting ? "Exporting..." : `Export ${reportLabels[activeReport] || "Report"}`}</span>
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        {availableReports.map((report) => (
          <button
            key={report}
            onClick={() => setActiveReport(report)}
            className={`px-4 py-2 rounded-lg transition text-sm sm:text-base flex-1 sm:flex-none ${
              activeReport === report
                ? "bg-green-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {reportLabels[report]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:p-8">{renderReport()}</div>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <AuthGuard requireAuth={true} permissionCheck={canViewReports}>
      <ReportsContent />
    </AuthGuard>
  )
}
