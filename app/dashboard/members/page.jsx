"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  getCurrentUser,
  getMembers,
  getDependents,
  addMember,
  deleteMember,
  getClaims,
  logoutUser,
} from "@/lib/storage"
import { Trash2, Edit2, Eye, X } from "lucide-react" // Added Eye and X icons
import AuthGuard from "@/components/auth-guard"
import Navbar from "@/components/navbar"
import Sidebar from "@/components/sidebar"
import MemberForm from "@/components/forms/member-form"
import SearchFilterBar from "@/components/search-filter-bar"

function MembersContent() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [members, setMembers] = useState([])
  const [dependents, setDependents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [viewingMemberDetails, setViewingMemberDetails] = useState(null) // NEW: State for the details modal
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({})

  // MCB Limit constant as defined in your MemberDashboard
  const MCB_LIMIT = 150000;

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    loadMembers()

    const handleStorageChange = (e) => {
      if (
        !e ||
        e.key === "we_care_members" ||
        e.key === "members" ||
        e.type === "storage"
      ) {
        loadMembers()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const loadMembers = () => {
    const data = getMembers() || []
    const deps = getDependents() || []
    setMembers(data)
    setDependents(deps)
  }

  const handleLogout = () => {
    logoutUser()
    router.push("/login")
  }

  const getMemberDependents = (memberId) => {
    return dependents.filter((d) => d.memberId === memberId)
  }

  const filteredMembers = useMemo(() => {
    let result = [...members]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (m) =>
          m.name?.toLowerCase().includes(term) ||
          m.email?.toLowerCase().includes(term) ||
          m.department?.toLowerCase().includes(term) ||
          m.id?.toLowerCase().includes(term)
      )
    }

    if (filters.department) {
      result = result.filter((m) => m.department === filters.department)
    }

    return result
  }, [members, searchTerm, filters])

  // Logic to calculate used MCB (Member + Dependents)
  const getMemberMCBUsed = (memberId) => {
    const claims = getClaims() || []
    const memberDependentIds = getMemberDependents(memberId).map((d) => d.id)

    const relevantClaims = claims.filter(
      (c) =>
        (String(c.memberId) === String(memberId) || memberDependentIds.includes(c.memberId)) &&
        c.status === "approved"
    )

    return relevantClaims.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0)
  }

  // NEW: Handler for viewing member details
  const handleViewMember = (member) => {
    setViewingMemberDetails(member);
  }

  const handleEditMember = (member) => {
    setEditingMember(member)
    setShowForm(true)
  }

  const handleDeleteMember = (memberId) => {
    if (confirm("Are you sure you want to delete this member?")) {
      deleteMember(memberId)
      loadMembers()
      window.dispatchEvent(new Event("storage"))
    }
  }

  const handleFormSubmit = (memberData) => {
    if (editingMember) {
      const updatedMembers = members.map((m) =>
        m.id === editingMember.id ? { ...m, ...memberData } : m
      )
      localStorage.setItem("we_care_members", JSON.stringify(updatedMembers))
    } else {
      addMember(memberData)
    }

    loadMembers()
    setShowForm(false)
    setEditingMember(null)
    window.dispatchEvent(new Event("storage"))
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Members Management</h1>
                <p className="text-gray-600 mt-2">Manage {members.length} registered members</p>
              </div>
            </div>

            <SearchFilterBar
              onSearch={setSearchTerm}
              onFilterChange={setFilters}
              showFilters={true}
            />

            {showForm && (
              <div className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold mb-4">
                  {editingMember ? "Edit Member" : "Add New Member"}
                </h2>
                <MemberForm
                  member={editingMember}
                  onSubmit={handleFormSubmit}
                  onCancel={() => {
                    setShowForm(false)
                    setEditingMember(null)
                  }}
                />
              </div>
            )}

            {/* NEW: Member Details Modal */}
            {viewingMemberDetails && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                  <button
                    onClick={() => setViewingMemberDetails(null)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                    title="Close Details"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pb-4 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Member details</h2>
                        <p className="font-mono text-sm text-gray-500">{viewingMemberDetails.id}</p>
                    </div>
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 self-start sm:self-center">
                        {viewingMemberDetails.status || "Active"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{viewingMemberDetails.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Department</p>
                      <p className="text-lg text-gray-900 mt-1">{viewingMemberDetails.department || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email Address</p>
                      <p className="text-lg text-gray-900 mt-1">{viewingMemberDetails.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="text-lg text-gray-900 mt-1">{viewingMemberDetails.phone || 'N/A'}</p>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Home Address</p>
                      <p className="text-lg text-gray-900 mt-1">{viewingMemberDetails.address || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t bg-gray-50 -m-8 p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Benefit Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white p-5 rounded-lg border">
                            <p className="text-sm font-medium text-gray-500">Used MCB</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">₱{getMemberMCBUsed(viewingMemberDetails.id).toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-5 rounded-lg border">
                            <p className="text-sm font-medium text-gray-500">Remaining MCB</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">₱{(Math.max(0, MCB_LIMIT - getMemberMCBUsed(viewingMemberDetails.id))).toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-5 rounded-lg border">
                            <p className="text-sm font-medium text-gray-500">Limit</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">₱{MCB_LIMIT.toLocaleString()}</p>
                        </div>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <button
                        onClick={() => setViewingMemberDetails(null)}
                        className="px-6 py-2.5 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition"
                    >
                        Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Member ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Department</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">MCB Used</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Remaining MCB</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No members found.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => {
                      const used = getMemberMCBUsed(member.id);
                      const remaining = Math.max(0, MCB_LIMIT - used);
                      
                      return (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono text-sm">{member.id}</td>
                          <td className="px-6 py-4 text-sm font-medium">{member.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{member.department}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ₱{used.toLocaleString()}
                          </td>
                          <td className={`px-6 py-4 text-sm font-bold ${remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₱{remaining.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {member.status || "Active"}
                            </span>
                          </td>
                          <td className="px-6 py-4 flex gap-2">
                            {/* NEW: View Details Button (Eye icon) */}
                            <button
                              onClick={() => handleViewMember(member)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditMember(member)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
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

export default function MembersPage() {
  return (
    <AuthGuard requireAuth={true}>
      <MembersContent />
    </AuthGuard>
  )
}