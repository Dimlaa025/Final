"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getAuditLogs, STORAGE_KEYS, addAuditLog } from "@/lib/storage"
import { canViewAuditLogs } from "@/lib/permissions"
import { Search, ChevronDown } from "lucide-react"
import AuthGuard from "@/components/auth-guard"

function AuditLogsContent() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [logs, setLogs] = useState([])
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState("all")
  const [sortBy, setSortBy] = useState("date-newest")
  const [showActionFilter, setShowActionFilter] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    loadData()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowActionFilter(false)
        setShowSortDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadData = () => {
    const allLogs = getAuditLogs()
    setLogs(allLogs.reverse())

    const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]")
    setUsers(allUsers)

    // Log audit log access
    const currentUser = getCurrentUser()
    if (currentUser) {
      addAuditLog("AUDIT_LOG_VIEWED", `Audit logs accessed by ${currentUser.name} - Total logs: ${allLogs.length}`, currentUser.id)
    }
  }

  const getUserName = (userId) => {
    const u = users.find((u) => u.id === userId)
    return u ? u.name : "Unknown"
  }

  const getUserRole = (userId) => {
    const u = users.find((u) => u.id === userId)
    return u ? u.role : "Unknown"
  }

  const filteredLogs = logs
    .filter((log) => {
      const matchesSearch =
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getUserName(log.userId).toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter = filterAction === "all" || log.action === filterAction

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-newest":
          return new Date(b.timestamp) - new Date(a.timestamp)
        case "date-oldest":
          return new Date(a.timestamp) - new Date(b.timestamp)
        case "action-asc":
          return a.action.localeCompare(b.action)
        case "action-desc":
          return b.action.localeCompare(a.action)
        default:
          return 0
      }
    })

  const actions = [...new Set(logs.map((l) => l.action))]

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">System activity and compliance tracking</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 sm:gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Action Type Filter Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setShowActionFilter(!showActionFilter)}
                className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition text-sm sm:text-base min-w-0"
              >
                <span className="text-xs sm:text-sm text-gray-700 truncate">
                  Filter by Action Type
                </span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
              </button>
              {showActionFilter && (
                <div className="absolute top-full mt-1 w-full sm:w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => {
                      setFilterAction("all")
                      setShowActionFilter(false)
                    }}
                    className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition break-words ${
                      filterAction === "all" ? "bg-green-50 text-green-700" : "text-gray-700"
                    }`}
                  >
                    All Actions
                  </button>
                  {actions.map((action) => (
                    <button
                      key={action}
                      onClick={() => {
                        setFilterAction(action)
                        setShowActionFilter(false)
                      }}
                      className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition break-words ${
                        filterAction === action ? "bg-green-50 text-green-700" : "text-gray-700"
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition text-sm sm:text-base min-w-0"
              >
                <span className="text-xs sm:text-sm text-gray-700 truncate">
                  Sort
                </span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
              </button>
              {showSortDropdown && (
                <div className="absolute top-full mt-1 w-full sm:w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setSortBy("date-newest")
                      setShowSortDropdown(false)
                    }}
                    className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition break-words ${
                      sortBy === "date-newest" ? "bg-green-50 text-green-700" : "text-gray-700"
                    }`}
                  >
                    Date (Newest First)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("date-oldest")
                      setShowSortDropdown(false)
                    }}
                    className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition break-words ${
                      sortBy === "date-oldest" ? "bg-green-50 text-green-700" : "text-gray-700"
                    }`}
                  >
                    Date (Oldest First)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("action-asc")
                      setShowSortDropdown(false)
                    }}
                    className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition break-words ${
                      sortBy === "action-asc" ? "bg-green-50 text-green-700" : "text-gray-700"
                    }`}
                  >
                    Action (A-Z)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("action-desc")
                      setShowSortDropdown(false)
                    }}
                    className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition break-words ${
                      sortBy === "action-desc" ? "bg-green-50 text-green-700" : "text-gray-700"
                    }`}
                  >
                    Action (Z-A)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Total logs counter */}
          <div className="flex items-center justify-center sm:justify-start text-gray-500 text-xs sm:text-sm break-words">
            Total logs: {filteredLogs.length}
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[600px] sm:min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-2 sm:px-3 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Timestamp</th>
              <th className="px-2 sm:px-3 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Action</th>
              <th className="px-2 sm:px-3 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">User</th>
              <th className="px-2 sm:px-3 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Role</th>
              <th className="px-2 sm:px-3 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-2 sm:px-3 md:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition">
                  <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 break-words">
                    <div className="whitespace-nowrap sm:whitespace-normal">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                    <span className="inline-flex items-center px-1 sm:px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 break-words">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium break-words">{getUserName(log.userId)}</td>
                  <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 break-words">{getUserRole(log.userId)}</td>
                  <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 break-words">
                    <div className="whitespace-normal overflow-visible">
                      {log.description}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-sm text-gray-500">
            No audit logs found.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="bg-white rounded-lg shadow p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{getUserName(log.userId)}</p>
                    <p className="text-xs text-gray-600">{getUserRole(log.userId)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">{log.description}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>


    </div>
  )
}

export default function AuditLogsPage() {
  return (
    <AuthGuard requireAuth={true} permissionCheck={canViewAuditLogs}>
      <AuditLogsContent />
    </AuthGuard>
  )
}
