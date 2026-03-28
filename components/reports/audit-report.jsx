"use client"

import { useEffect, useState } from "react"
import { getAuditLogs, STORAGE_KEYS } from "@/lib/storage"
import { ChevronDown } from "lucide-react"

export default function AuditReport({ user }) {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-newest")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [users, setUsers] = useState([])

  useEffect(() => {
    const allLogs = getAuditLogs()
    setLogs(allLogs)

    const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]")
    setUsers(allUsers)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowFilterDropdown(false)
        setShowSortDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.name : "Unknown"
  }

  const filteredLogs = (filter === "all" ? logs : logs.filter((l) => l.action === filter))
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Audit Log Report</h2>

      <div className="mb-6 flex gap-4">
        {/* Filter Dropdown */}
        <div className="relative dropdown-container">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition"
          >
            <span className="text-sm text-gray-700">
              Filter by Action Type
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          {showFilterDropdown && (
            <div className="absolute top-full mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setFilter("all")
                  setShowFilterDropdown(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                  filter === "all" ? "bg-white text-green-700" : "text-gray-700"
                }`}
              >
                All Actions
              </button>
              {actions.map((action) => (
                <button
                  key={action}
                  onClick={() => {
                    setFilter(action)
                    setShowFilterDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                    filter === action ? "bg-white text-green-700" : "text-gray-700"
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
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition"
          >
            <span className="text-sm text-gray-700">
              Sort
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          {showSortDropdown && (
            <div className="absolute top-full mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setSortBy("date-newest")
                  setShowSortDropdown(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                  sortBy === "date-newest" ? "bg-white text-green-700" : "text-gray-700"
                }`}
              >
                Date (Newest First)
              </button>
              <button
                onClick={() => {
                  setSortBy("date-oldest")
                  setShowSortDropdown(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                  sortBy === "date-oldest" ? "bg-white text-green-700" : "text-gray-700"
                }`}
              >
                Date (Oldest First)
              </button>
              <button
                onClick={() => {
                  setSortBy("action-asc")
                  setShowSortDropdown(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                  sortBy === "action-asc" ? "bg-white text-green-700" : "text-gray-700"
                }`}
              >
                Action (A-Z)
              </button>
              <button
                onClick={() => {
                  setSortBy("action-desc")
                  setShowSortDropdown(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                  sortBy === "action-desc" ? "bg-white text-green-700" : "text-gray-700"
                }`}
              >
                Action (Z-A)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-gray-600 text-sm">Total Events</p>
          <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-gray-600 text-sm">Unique Actions</p>
          <p className="text-2xl font-bold text-gray-900">{actions.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-gray-600 text-sm">Active Users</p>
          <p className="text-2xl font-bold text-gray-900">{new Set(filteredLogs.map((l) => l.userId)).size}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Timestamp</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Action</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">User</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{log.action}</td>
                  <td className="px-4 py-3 text-gray-600">{getUserName(log.userId)}</td>
                  <td className="px-4 py-3 text-gray-600">{log.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
