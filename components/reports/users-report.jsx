"use client"

import { useEffect, useState } from "react"
import { STORAGE_KEYS } from "@/lib/storage"

export default function UsersReport({ user }) {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    byRole: {},
    active: 0,
  })

  useEffect(() => {
    const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]")
    setUsers(allUsers)

    const byRole = {}
    allUsers.forEach((u) => {
      byRole[u.role] = (byRole[u.role] || 0) + 1
    })

    setStats({
      total: allUsers.length,
      byRole,
      active: allUsers.filter((u) => u.status === "active").length,
    })
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Users Report</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-gray-600 text-sm font-semibold">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-gray-600 text-sm font-semibold">Active Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-gray-600 text-sm font-semibold">Roles</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{Object.keys(stats.byRole).length}</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(stats.byRole).map(([role, count]) => (
            <div key={role} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-600 text-sm">{role}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User List</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Department</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.role}</td>
                  <td className="px-4 py-3 text-gray-600">{u.department}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
