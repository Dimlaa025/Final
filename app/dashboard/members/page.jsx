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
import { Plus, Trash2, Edit2 } from "lucide-react"
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
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({})

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

  const getMemberMCBUsed = (memberId) => {
    const claims = getClaims() || []
    const memberDependentIds = getMemberDependents(memberId).map((d) => d.id)

    const relevantClaims = claims.filter(
      (c) =>
        (c.memberId === memberId || memberDependentIds.includes(c.memberId)) &&
        c.status === "approved"
    )

    return relevantClaims.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0)
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

              <button
                onClick={() => {
                  setEditingMember(null)
                  setShowForm(true)
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                Add Member
              </button>
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

            <div className="mt-6 bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Member ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      MCB Used
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No members found.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-sm">{member.id}</td>
                        <td className="px-6 py-4 text-sm font-medium">{member.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{member.department}</td>
                        <td className="px-6 py-4 text-sm">
                          ₱{getMemberMCBUsed(member.id).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {member.status || "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
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

export default function MembersPage() {
  return (
    <AuthGuard requireAuth={true}>
      <MembersContent />
    </AuthGuard>
  )
}