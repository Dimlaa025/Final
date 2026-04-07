"use client"

import { useEffect, useState } from "react"
import { getMembers, getClaims } from "@/lib/storage"

export default function DepartmentReport({ user }) {
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    const members = getMembers()
    const claims = getClaims()

    const deptMap = {}
    members.forEach((member) => {
      if (!deptMap[member.department]) {
        deptMap[member.department] = {
          name: member.department,
          members: 0,
          claims: 0,
          approvedClaims: 0,
          totalAmount: 0,
        }
      }
      deptMap[member.department].members += 1

      const memberClaims = claims.filter((c) => c.memberId === member.id)
      deptMap[member.department].claims += memberClaims.length
      deptMap[member.department].approvedClaims += memberClaims.filter((c) => c.status === "approved").length
      deptMap[member.department].totalAmount += memberClaims.reduce(
        (sum, c) => sum + Number.parseFloat(c.amount || 0),
        0,
      )
    })

    setDepartments(Object.values(deptMap))
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Department Report</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Department</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Members</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Total Claims</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Approved</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Total Amount</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Avg Claim</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {departments.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                  No department data available.
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.name} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{dept.name}</td>
                  <td className="px-4 py-3 text-gray-600">{dept.members}</td>
                  <td className="px-4 py-3 text-gray-600">{dept.claims}</td>
                  <td className="px-4 py-3 text-gray-600">{dept.approvedClaims}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">₱{dept.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    ₱{dept.claims > 0 ? (dept.totalAmount / dept.claims).toFixed(2) : 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
