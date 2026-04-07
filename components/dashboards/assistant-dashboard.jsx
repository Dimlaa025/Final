"use client"

import { useEffect, useState } from "react"
import { getClaims, getUsers, updateUserStatus, addMember, addAuditLog } from "@/lib/storage"
import { canCreateClaims, canViewReports, canApproveMembers } from "@/lib/permissions"
import { Check, X, Clock } from "lucide-react"

export default function AssistantDashboard({ user }) {
  const [stats, setStats] = useState({
    claimsCreated: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
  })
  const [pendingUsers, setPendingUsers] = useState([])

  const loadData = () => {
    // 1. Fetch all data from storage
    const allClaims = getClaims()
    const allUsers = getUsers()
    
    // 2. Filter Claims created by this Assistant
    const myClaims = allClaims.filter((c) => c.createdBy === user.id)
    
    // 3. Filter Pending Registrations (The ones in your table)
    const pendingRegs = allUsers.filter(u => u.status === "pending")
    setPendingUsers(pendingRegs)

    // 4. Calculate Stats for the Dashboard Cards
    // We add the count of pending claims + pending registrations
    const pendingClaimsCount = myClaims.filter(c => c.status === "submitted" || c.status === "pending-approval").length
    
    setStats({
      claimsCreated: myClaims.length,
      // REAL-TIME LINK: This adds both types of pending items
      pendingReview: pendingClaimsCount + pendingRegs.length, 
      
      approved: myClaims.filter(c => c.status === "approved").length,
      rejected: myClaims.filter(c => c.status === "rejected").length,
    })
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleApprove = (targetUser) => {
    updateUserStatus(targetUser.id, "active")
    
    addMember({
      id: targetUser.memberId || `MEM-${Date.now()}`,
      name: targetUser.name,
      email: targetUser.email,
      department: targetUser.department,
      status: "active",
      mcbUsed: 0
    })

    addAuditLog("MEMBER_APPROVAL", `Approved ${targetUser.name}`, user.id)
    
    // This is the "Real-time" magic: 
    // Re-running loadData() updates the stats cards immediately
    loadData() 
  }

  const handleReject = (userId) => {
    if (confirm("Reject this registration?")) {
      updateUserStatus(userId, "rejected")
      loadData() // Stats will update immediately
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>
        <p className="text-gray-600 mt-2">Assistant Dashboard - Claims & Member Management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Claims Created</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.claimsCreated}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm">Pending Review</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingReview}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Approved</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm">Rejected</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.rejected}</p>
        </div>
      </div>

      {/* APPROVAL QUEUE TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-orange-50/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="text-orange-500" />
            Pending Member Approvals
          </h2>
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
            {pendingUsers.length} Pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-500">No registrations waiting for approval.</td>
                </tr>
              ) : (
                pendingUsers.map((pUser) => (
                  <tr key={pUser.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium">{pUser.name}</td>
                    <td className="p-4">{pUser.email}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => handleApprove(pUser)} className="p-2 bg-green-500 text-white rounded-lg"><Check size={18} /></button>
                      <button onClick={() => handleReject(pUser.id)} className="p-2 bg-red-500 text-white rounded-lg"><X size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}