"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  getCurrentUser,
  getMembers,
  getUsers,
  getDependents,
  addDependent,
  deleteDependent,
  updateDependent,
  logoutUser,
} from "@/lib/storage"
import { Plus, Trash2, Edit, AlertCircle } from "lucide-react"
import AuthGuard from "@/components/auth-guard"
import DependentForm from "@/components/forms/dependent-form"
import SearchFilterBar from "@/components/search-filter-bar"
import Navbar from "@/components/navbar"
import Sidebar from "@/components/sidebar"

function DependentsContent() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [members, setMembers] = useState([])
  const [systemUsers, setSystemUsers] = useState([])
  const [dependents, setDependents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingDependent, setEditingDependent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    loadData(currentUser)
  }, [])

  const loadData = (currentUser = user) => {
    if (!currentUser) return
    
    const allMembers = getMembers() || []
    const allUsers = getUsers() || []
    const allDeps = getDependents() || []
    
    setMembers(allMembers)
    setSystemUsers(allUsers)

    // --- CRITICAL FIX: CASE-INSENSITIVE KEYWORD CHECK ---
    // This correctly identifies "IT/Admin", "Director", and "Assistant"
    const roleString = (currentUser.role || "").toLowerCase();
    const isPrivileged = roleString.includes("admin") || 
                         roleString.includes("director") || 
                         roleString.includes("assistant");
    
    if (!isPrivileged) {
      // Regular members see only their own
      const privateList = allDeps.filter((d) => d.memberId === currentUser.id)
      setDependents(privateList)
    } else {
      // Management roles see the FULL list
      setDependents(allDeps)
    }
  }

  const getOwnerName = (memberId) => {
    const member = members.find(m => m.id === memberId)
    if (member) return member.name
    const sysUser = systemUsers.find(u => u.id === memberId)
    if (sysUser) return sysUser.name
    return memberId || "Unknown Member"
  }

  // Define privilege status for UI elements
  const userRole = (user?.role || "").toLowerCase();
  const isPrivileged = userRole.includes("admin") || 
                       userRole.includes("director") || 
                       userRole.includes("assistant");

  // LIMIT LOGIC: Only apply the 4-dependent cap to regular Members.
  // Management (Admin/Director/Assistant) are EXEMPT.
  const limitReached = !isPrivileged && dependents.length >= 4 

  const handleFormSubmit = (dependentData) => {
    const finalData = {
      ...dependentData,
      memberId: isPrivileged ? (dependentData.memberId || user.id) : user.id,
      status: "active" 
    }

    if (editingDependent) {
      updateDependent(editingDependent.id, finalData)
    } else {
      // Logic inside storage.js prevents members from adding > 4
      addDependent(finalData)
    }

    loadData(user)
    setShowForm(false)
    setEditingDependent(null)
  }

  if (!user) return <div className="flex h-screen items-center justify-center">Loading...</div>

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onLogout={() => { logoutUser(); router.push("/login"); }} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {/* Displays Management for Admin, Director, and Assistant */}
                  {isPrivileged ? "Dependents Management" : "My Dependents"}
                </h1>
                <p className={`${limitReached ? "text-red-600 font-bold" : "text-gray-600"}`}>
                  {isPrivileged 
                    ? `System-wide Management: ${dependents.length} records` 
                    : limitReached 
                      ? "Maximum limit of 4 dependents reached" 
                      : `You have registered ${dependents.length} of 4 dependents`}
                </p>
              </div>

              <button
                disabled={limitReached}
                onClick={() => { setEditingDependent(null); setShowForm(!showForm); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                  limitReached 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-green-600 hover:bg-green-700 text-white shadow-md"
                }`}
              >
                {limitReached ? <AlertCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {limitReached ? "Limit Reached" : "Add Dependent"}
              </button>
            </div>

            <SearchFilterBar onSearch={setSearchTerm} showFilters={false} />

            {showForm && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h2 className="text-lg font-bold mb-4">{editingDependent ? 'Edit' : 'New'} Dependent</h2>
                <DependentForm
                  dependent={editingDependent}
                  members={members}
                  onSubmit={handleFormSubmit}
                  onCancel={() => { setShowForm(false); setEditingDependent(null); }}
                  currentUser={user}
                />
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Relationship</th>
                    {/* Shows Owner Column for Admin, Director, Assistant */}
                    {isPrivileged && <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Member Owner</th>}
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">DOB</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dependents.length === 0 ? (
                    <tr>
                      <td colSpan={isPrivileged ? 5 : 4} className="px-6 py-10 text-center text-gray-500">No dependents found.</td>
                    </tr>
                  ) : (
                    dependents.map((dep) => (
                      <tr key={dep.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{dep.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{dep.relationship}</td>
                        {isPrivileged && (
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                            {getOwnerName(dep.memberId)}
                          </td>
                        )}
                        <td className="px-6 py-4 text-sm text-gray-600">{dep.dateOfBirth}</td>
                        <td className="px-6 py-4 flex justify-center gap-4">
                          <button onClick={() => { setEditingDependent(dep); setShowForm(true); }} className="text-blue-600"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => { if(confirm("Remove?")) { deleteDependent(dep.id); loadData(user); }}} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DependentsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <DependentsContent />
    </AuthGuard>
  )
}