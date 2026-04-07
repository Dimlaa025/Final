"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getMembers, getDependents, addDependent, deleteDependent, updateDependent, getDependentsByMemberId, searchDependents } from "@/lib/storage"
import { canManageDependents, canViewOwnDependents, canViewAllDependents } from "@/lib/permissions"
import { Plus, Trash2, Edit } from "lucide-react"
import AuthGuard from "@/components/auth-guard"
import DependentForm from "@/components/forms/dependent-form"
import SearchFilterBar from "@/components/search-filter-bar"

function DependentsContent() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [members, setMembers] = useState([])
  const [dependents, setDependents] = useState([])
  const [filteredDependents, setFilteredDependents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingDependent, setEditingDependent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    loadData()
  }, [])

  const loadData = () => {
    setMembers(getMembers())
    const deps = getDependents()

    // Filter dependents based on user permissions
    const currentUser = getCurrentUser()
    let userDependents = deps

    if (currentUser && canViewOwnDependents(currentUser) && !canViewAllDependents(currentUser)) {
      // Users with only view_own permission can only see their own dependents
      userDependents = deps.filter((d) => d.memberId === currentUser.id)
    }

    setDependents(userDependents)
    setFilteredDependents(userDependents)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    const currentUser = getCurrentUser()
    if (term) {
      const filtered = searchDependents(term, currentUser)
      setFilteredDependents(filtered)
    } else {
      setFilteredDependents(dependents)
    }
  }

  const handleAddDependent = (dependentData) => {
    try {
      // For users with only view_own permission, auto-set memberId and status
      const currentUser = getCurrentUser()
      let finalData = dependentData

      if (currentUser && canViewOwnDependents(currentUser) && !canManageDependents(currentUser)) {
        finalData = {
          ...dependentData,
          memberId: currentUser.id,
          status: "Pending Approval"
        }
      }

      addDependent(finalData)
      loadData()
      setShowForm(false)
      setEditingDependent(null)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleEditDependent = (dependentData) => {
    try {
      updateDependent(editingDependent.id, dependentData)
      loadData()
      setShowForm(false)
      setEditingDependent(null)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleDeleteDependent = (dependentId) => {
    if (confirm("Are you sure you want to delete this dependent?")) {
      deleteDependent(dependentId)
      loadData()
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Pending Approval":
        return "bg-yellow-100 text-yellow-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const canAddDependent = (user) => {
    if (canViewOwnDependents(user) && !canManageDependents(user)) {
      const memberDependents = getDependentsByMemberId(user.id)
      return memberDependents.length < 4
    }
    return canManageDependents(user)
  }

  const canDeleteDependent = (dependent, user) => {
    if (canViewOwnDependents(user) && !canManageDependents(user)) {
      return dependent.status === "Pending Approval"
    }
    return canManageDependents(user)
  }

  const getMemberName = (memberId) => {
    const member = members.find((m) => m.id === memberId)
    return member ? member.name : "Unknown"
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (canViewOwnDependents(user) && !canManageDependents(user)) {
    // Read-only dependents view for users who can only view their own dependents
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Dependents</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">Manage your family dependents</p>
          </div>
          <button
            onClick={() => {
              setEditingDependent(null)
              setShowForm(!showForm)
            }}
            disabled={!canAddDependent(user)}
            title={!canAddDependent(user) ? "You've reached the maximum of 4 dependents" : ""}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base ${
              canAddDependent(user)
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Dependent
          </button>
        </div>

        {/* Search Bar */}
        <SearchFilterBar
          onSearch={handleSearch}
          showFilters={false}
        />

        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <DependentForm
              dependent={editingDependent}
              members={members}
              onSubmit={editingDependent ? handleEditDependent : handleAddDependent}
              onCancel={() => {
                setShowForm(false)
                setEditingDependent(null)
              }}
              currentUser={user}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Name</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Relationship</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Date of Birth</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Status</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDependents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-2 sm:px-4 py-6 sm:py-8 text-center text-sm text-gray-500">
                    You currently have no registered dependents. You may add up to 4 dependents, subject to approval.
                  </td>
                </tr>
              ) : (
                filteredDependents.map((dependent) => (
                  <tr key={dependent.id} className="hover:bg-gray-50 transition">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-gray-900 break-words">{dependent.name}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-gray-600 break-words">{dependent.relationship}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-gray-600 break-words">{dependent.dateOfBirth}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium break-words ${getStatusColor(dependent.status)}`}
                      >
                        {dependent.status}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingDependent(dependent)
                          setShowForm(true)
                        }}
                        className="p-1 hover:bg-blue-50 rounded transition text-blue-600"
                        title="Edit"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      {canDeleteDependent(dependent, user) && (
                        <button
                          onClick={() => handleDeleteDependent(dependent.id)}
                          className="p-1 hover:bg-red-50 rounded transition text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
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

  // Admin/Director/Assistant view
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dependents Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Manage member dependents (spouse, children, etc.)</p>
        </div>
        {canManageDependents(user) && (
          <button
            onClick={() => {
              setEditingDependent(null)
              setShowForm(!showForm)
            }}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Dependent
          </button>
        )}
      </div>

      {/* Search Bar */}
      <SearchFilterBar
        onSearch={handleSearch}
        showFilters={false}
      />

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <DependentForm
            dependent={editingDependent}
            members={members}
            onSubmit={editingDependent ? handleEditDependent : handleAddDependent}
            onCancel={() => {
              setShowForm(false)
              setEditingDependent(null)
            }}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Name</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Relationship</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Member ID</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Member</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Date of Birth</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Status</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDependents.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-2 sm:px-4 py-6 sm:py-8 text-center text-sm text-gray-500">
                  No dependents found. Add a new dependent to get started.
                </td>
              </tr>
            ) : (
              filteredDependents.map((dependent) => (
                <tr key={dependent.id} className="hover:bg-gray-50 transition">
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-gray-900 break-words">{dependent.name}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-gray-600 break-words">{dependent.relationship}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs font-mono text-gray-900 break-words">{dependent.memberId}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-gray-600 break-words">{getMemberName(dependent.memberId)}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-gray-600 break-words">{dependent.dateOfBirth}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium break-words bg-green-100 text-green-800">
                      {dependent.status}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs flex items-center gap-1">
                    {canManageDependents(user) && (
                      <>
                        <button
                          onClick={() => {
                            setEditingDependent(dependent)
                            setShowForm(true)
                          }}
                          className="p-1 hover:bg-blue-50 rounded transition text-blue-600"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteDependent(dependent.id)}
                          className="p-1 hover:bg-red-50 rounded transition text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
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

export default function DependentsPage() {
  return (
    <AuthGuard requireAuth={true} permissionCheck={(user) => canViewOwnDependents(user) || canManageDependents(user) || canViewAllDependents(user)}>
      <DependentsContent />
    </AuthGuard>
  )
}
