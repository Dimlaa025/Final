"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  getCurrentUser,
  getUsers,
  getRoles,
  getPermissions,
  changeUserRole,
  resetUserPassword,
  createRole,
  updateRole,
  deleteRole,
  addAuditLog,
  addNotification,
  addMember,
  getMembers,
  STORAGE_KEYS,
  logoutUser,
} from "@/lib/storage"
import { canManageUsers, canManageRoles } from "@/lib/permissions"
import { generateSecurePassword } from "@/lib/utils"
import AuthGuard from "@/components/auth-guard"
import Navbar from "@/components/navbar"
import Sidebar from "@/components/sidebar"
import { Shield, Users, Lock, Plus, Edit, Trash2, Key } from "lucide-react"

function RBACSettingsContent() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [activeTab, setActiveTab] = useState("users")
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [showEditRole, setShowEditRole] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [newRole, setNewRole] = useState({ name: "", description: "", permissions: [] })
  const [editRole, setEditRole] = useState({ name: "", description: "", permissions: [] })
  const [pendingUsers, setPendingUsers] = useState([])
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectedPendingUsers, setSelectedPendingUsers] = useState([])
  const [bulkRoleId, setBulkRoleId] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    loadData()
  }, [])

  const loadData = () => {
    const allUsers = getUsers()
    setUsers(allUsers.filter((u) => u.status === "active"))
    setPendingUsers(allUsers.filter((u) => u.status === "pending"))
    setRoles(getRoles())
    setPermissions(getPermissions())
  }

  const handleLogout = () => {
    logoutUser()
    router.push("/login")
  }

  const handleRoleChange = (userId, roleId) => {
    const result = changeUserRole(userId, roleId)
    if (result) {
      loadData()
      addAuditLog("ROLE_CHANGE", `Changed user role to ${roleId}`, user.id)
    }
  }

  const handlePasswordReset = (userId) => {
    const newPassword = generateSecurePassword()
    const success = resetUserPassword(userId, newPassword)
    if (success) {
      const targetUser = users.find((u) => u.id === userId)
      addAuditLog("PASSWORD_RESET", `Reset password for user ${targetUser?.name || "Unknown"}`, user.id)
      alert(`Password reset to: ${newPassword}\n\nPlease save this password securely. The user will need to change it on first login.`)
    }
  }

  const handleApproveUser = (userId) => {
    const allUsers = getUsers()
    const userToApprove = allUsers.find((u) => u.id === userId)
    if (userToApprove) {
      const updatedUser = { ...userToApprove, status: "active" }
      const updatedUsers = allUsers.map((u) => (u.id === userId ? updatedUser : u))
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers))

      setPendingUsers(pendingUsers.filter((u) => u.id !== userId))
      setUsers([...users, updatedUser])

      const memberData = {
        id: userToApprove.memberId || undefined,
        name: userToApprove.name,
        email: userToApprove.email,
        phone: "",
        department: userToApprove.department,
        dateOfBirth: "",
        address: "",
        userId: userId,
      }
      addMember(memberData)

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "we_care_members",
          newValue: JSON.stringify(getMembers()),
        })
      )

      addNotification(userId, "Your account has been approved! You can now log in.", "success")
      addAuditLog("USER_APPROVED", `Approved user ${userToApprove.name}`, user.id)
    }
  }

  const handleRejectUser = (userId) => {
    if (confirm("Are you sure you want to reject this user registration?")) {
      const allUsers = getUsers()
      const userToReject = allUsers.find((u) => u.id === userId)
      if (userToReject) {
        const updatedUsers = allUsers.filter((u) => u.id !== userId)
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers))

        setPendingUsers(pendingUsers.filter((u) => u.id !== userId))
        addAuditLog("USER_REJECTED", `Rejected user ${userToReject.name}`, user.id)
        addNotification(userId, "Your account registration has been rejected.", "error")
      }
    }
  }

  const handleBulkApprove = () => {
    if (selectedPendingUsers.length === 0) return

    if (confirm(`Are you sure you want to approve ${selectedPendingUsers.length} users?`)) {
      const allUsers = getUsers()
      let updatedUsers = [...allUsers]
      const approvedUsers = []

      selectedPendingUsers.forEach((userId) => {
        const userToApprove = allUsers.find((u) => u.id === userId)
        if (userToApprove) {
          const updatedUser = { ...userToApprove, status: "active" }
          updatedUsers = updatedUsers.map((u) => (u.id === userId ? updatedUser : u))
          approvedUsers.push(updatedUser)

          const memberData = {
            id: userToApprove.memberId || undefined,
            name: userToApprove.name,
            email: userToApprove.email,
            phone: "",
            department: userToApprove.department,
            dateOfBirth: "",
            address: "",
            userId: userId,
          }
          addMember(memberData)

          addNotification(userId, "Your account has been approved! You can now log in.", "success")
          addAuditLog("USER_APPROVED", `Approved user ${userToApprove.name}`, user.id)
        }
      })

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers))
      setPendingUsers(pendingUsers.filter((u) => !selectedPendingUsers.includes(u.id)))
      setUsers([...users, ...approvedUsers])
      setSelectedPendingUsers([])

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "we_care_members",
          newValue: JSON.stringify(getMembers()),
        })
      )
    }
  }

  const handleBulkReject = () => {
    if (selectedPendingUsers.length === 0) return

    if (confirm(`Are you sure you want to reject ${selectedPendingUsers.length} users?`)) {
      const allUsers = getUsers()
      const updatedUsers = allUsers.filter((u) => !selectedPendingUsers.includes(u.id))

      selectedPendingUsers.forEach((userId) => {
        const userToReject = allUsers.find((u) => u.id === userId)
        if (userToReject) {
          addNotification(userId, "Your account registration has been rejected.", "error")
          addAuditLog("USER_REJECTED", `Rejected user ${userToReject.name}`, user.id)
        }
      })

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers))
      setPendingUsers(pendingUsers.filter((u) => !selectedPendingUsers.includes(u.id)))
      setSelectedPendingUsers([])
    }
  }

  const handleBulkRoleChange = () => {
    if (selectedUsers.length === 0 || !bulkRoleId) return

    if (confirm(`Are you sure you want to change the role for ${selectedUsers.length} users?`)) {
      selectedUsers.forEach((userId) => {
        const updatedUser = changeUserRole(userId, bulkRoleId)
        if (updatedUser) {
          setUsers(users.map((u) => (u.id === userId ? updatedUser : u)))
          addAuditLog("ROLE_CHANGE", `Changed user ${updatedUser.name} role to ${updatedUser.role}`, user.id)
        }
      })

      setSelectedUsers([])
      setBulkRoleId("")
    }
  }

  const handleUserSelect = (userId, isSelected) => {
    if (isSelected) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    }
  }

  const handlePendingUserSelect = (userId, isSelected) => {
    if (isSelected) {
      setSelectedPendingUsers([...selectedPendingUsers, userId])
    } else {
      setSelectedPendingUsers(selectedPendingUsers.filter((id) => id !== userId))
    }
  }

  const getFilteredUsers = () => {
    let filtered = users

    if (userSearchTerm) {
      filtered = filtered.filter(
        (u) =>
          (u.name?.toLowerCase() || "").includes(userSearchTerm.toLowerCase()) ||
          (u.email?.toLowerCase() || "").includes(userSearchTerm.toLowerCase()) ||
          (u.role?.toLowerCase() || "").includes(userSearchTerm.toLowerCase())
      )
    }

    if (departmentFilter) {
      filtered = filtered.filter((u) => u.department === departmentFilter)
    }

    if (roleFilter) {
      filtered = filtered.filter((u) => u.role === roleFilter)
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filtered = filtered.filter((u) => new Date(u.createdAt) >= fromDate)
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((u) => new Date(u.createdAt) <= toDate)
    }

    return filtered
  }

  const filteredUsers = getFilteredUsers()

  const handleCreateRole = () => {
    if (!newRole.name.trim()) return

    const roleData = {
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions,
    }

    const createdRole = createRole(roleData)
    if (createdRole) {
      setRoles([...roles, createdRole])
      setNewRole({ name: "", description: "", permissions: [] })
      setShowCreateRole(false)
      addAuditLog("ROLE_CREATE", `Created new role: ${createdRole.name}`, user.id)
    }
  }

  const handleDeleteRole = (roleId) => {
    if (confirm("Are you sure you want to delete this role?")) {
      const success = deleteRole(roleId)
      if (success) {
        setRoles(roles.filter((r) => r.id !== roleId))
        addAuditLog("ROLE_DELETE", `Deleted role ${roleId}`, user.id)
      }
    }
  }

  const handleEditRole = (role) => {
    setEditingRole(role)
    setEditRole({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    })
    setShowEditRole(true)
  }

  const handleUpdateRole = () => {
    if (!editRole.name.trim()) return

    const roleData = {
      name: editRole.name,
      description: editRole.description,
      permissions: editRole.permissions,
    }

    const updatedRole = updateRole(editingRole.id, roleData)
    if (updatedRole) {
      setRoles(roles.map((r) => (r.id === editingRole.id ? updatedRole : r)))
      setEditRole({ name: "", description: "", permissions: [] })
      setEditingRole(null)
      setShowEditRole(false)
      addAuditLog("ROLE_UPDATE", `Updated role: ${updatedRole.name}`, user.id)
    }
  }

  const getPermissionCategories = () => {
    const categories = {}
    permissions.forEach((perm) => {
      if (!categories[perm.category]) {
        categories[perm.category] = []
      }
      categories[perm.category].push(perm)
    })
    return categories
  }

  const permissionCategories = getPermissionCategories()

  const getRoleClass = (role) => {
    switch (role) {
      case "IT/Admin":
        return "bg-red-100 text-red-800"
      case "Director":
        return "bg-blue-100 text-blue-800"
      case "Assistant":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">RBAC Settings</h1>
            </div>

            <div className="sticky top-0 z-10 bg-gray-50 -mx-4 px-4 py-3 border-b border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "users" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  Users ({users.length + pendingUsers.length})
                </button>
                <button
                  onClick={() => setActiveTab("roles")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "roles" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  Roles ({roles.length})
                </button>
              </div>
            </div>

            {(activeTab === "users" || activeTab === "pending") && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-row items-center justify-between mb-4 gap-3 sm:gap-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Management
                  </h2>
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={() => setActiveTab("users")}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition ${
                        activeTab === "users" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Active Users ({users.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("pending")}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition ${
                        activeTab === "pending" ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Pending Approvals ({pendingUsers.length})
                    </button>
                  </div>
                </div>

                {activeTab === "users" && (
                  <div>
                    <div className="mb-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <input
                          type="text"
                          placeholder="Search by name, email, or role..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <select
                          value={departmentFilter}
                          onChange={(e) => setDepartmentFilter(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">All Departments</option>
                          <option value="IT">IT</option>
                          <option value="HR">HR</option>
                          <option value="Finance">Finance</option>
                          <option value="Operations">Operations</option>
                        </select>

                        <select
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">All Roles</option>
                          {roles.map((role, index) => (
                            <option key={`role-filter-${index}`} value={role.name}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setUserSearchTerm("")
                            setDepartmentFilter("")
                            setStatusFilter("")
                            setRoleFilter("")
                            setDateFrom("")
                            setDateTo("")
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>

                    {selectedUsers.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-800">
                            {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
                          </span>
                          <div className="flex items-center gap-2">
                            <select
                              value={bulkRoleId}
                              onChange={(e) => setBulkRoleId(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="">Select Role</option>
                              {roles.map((role, index) => (
                                <option key={`bulk-${role.id}-${index}`} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={handleBulkRoleChange}
                              disabled={!bulkRoleId}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
                            >
                              Change Role
                            </button>
                            <button
                              onClick={() => setSelectedUsers([])}
                              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg mb-2">
                        <div className="flex items-center gap-2"></div>
                        <span className="text-sm text-gray-500">{filteredUsers.length} users</span>
                      </div>

                      {filteredUsers.map((u, index) => (
                        <div
                          key={u.id || `user-${index}`}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(u.id)}
                              onChange={(e) => handleUserSelect(u.id, e.target.checked)}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 break-words">{u.name || "Unknown"}</p>
                              <p className="text-sm text-gray-600 break-words">{u.email || "No email"}</p>
                              <p className="text-xs text-gray-500 break-words">{u.department || "No department"}</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <span
                              className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium break-words whitespace-nowrap ${getRoleClass(
                                u.role || "Unknown"
                              )}`}
                            >
                              {u.role || "Unknown"}
                            </span>

                            {canManageUsers(user) && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handlePasswordReset(u.id)}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md flex-shrink-0"
                                  title="Reset Password"
                                >
                                  <Key className="w-4 h-4" />
                                </button>
                                <select
                                  value={u.role || ""}
                                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                  className="px-1 sm:px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-w-0"
                                >
                                  {roles.map((role, index) => (
                                    <option key={`user-role-${role.id}-${index}`} value={role.id}>
                                      {role.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "pending" && (
                  <div>
                    {selectedPendingUsers.length > 0 && (
                      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-orange-800">
                            {selectedPendingUsers.length} pending user{selectedPendingUsers.length > 1 ? "s" : ""} selected
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleBulkApprove}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                            >
                              Approve All
                            </button>
                            <button
                              onClick={handleBulkReject}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                            >
                              Reject All
                            </button>
                            <button
                              onClick={() => setSelectedPendingUsers([])}
                              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg mb-2">
                        <div className="flex items-center gap-2"></div>
                        <span className="text-sm text-orange-600">{pendingUsers.length} pending</span>
                      </div>

                      {pendingUsers.map((u, index) => (
                        <div
                          key={u.id || `pending-${index}`}
                          className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedPendingUsers.includes(u.id)}
                              onChange={(e) => handlePendingUserSelect(u.id, e.target.checked)}
                              className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                            />
                            <div>
                              <p className="font-medium text-gray-800">{u.name || "Unknown"}</p>
                              <p className="text-sm text-gray-600">{u.email || "No email"}</p>
                              <p className="text-xs text-gray-500">{u.department || "No department"}</p>
                              <p className="text-xs text-orange-600 mt-1">
                                Registered: {new Date(u.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                              Pending Approval
                            </span>

                            {canManageUsers(user) && (
                              <>
                                <button
                                  onClick={() => handleApproveUser(u.id)}
                                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectUser(u.id)}
                                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}

                      {pendingUsers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>No pending user registrations</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "roles" && canManageRoles(user) && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Role Management
                  </h2>
                  <button
                    onClick={() => setShowCreateRole(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    Create Role
                  </button>
                </div>

                <div className="space-y-4 max-h-96 md:max-h-none overflow-y-auto md:overflow-visible">
                  {roles.map((role, index) => (
                    <div
                      key={role.id || `role-${index}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 break-words">{role.name}</p>
                        <p className="text-sm text-gray-600 break-words">{role.description}</p>
                        <p className="text-xs text-gray-500 break-words">{role.permissions.length} permissions</p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md flex-shrink-0"
                          title="Edit Role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!role.isSystem && (
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md flex-shrink-0"
                            title="Delete Role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {role.isSystem && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded whitespace-nowrap">
                            System Role
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showCreateRole && (
              <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Role</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                      <input
                        type="text"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter role name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={newRole.description}
                        onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter role description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {Object.entries(permissionCategories).map(([category, perms]) => (
                          <div key={category}>
                            <h4 className="font-medium text-gray-800 mb-2">{category}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {perms.map((perm) => (
                                <label key={perm.id} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={newRole.permissions.includes(perm.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setNewRole({ ...newRole, permissions: [...newRole.permissions, perm.id] })
                                      } else {
                                        setNewRole({
                                          ...newRole,
                                          permissions: newRole.permissions.filter((p) => p !== perm.id),
                                        })
                                      }
                                    }}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                  />
                                  <span className="text-sm text-gray-700">{perm.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowCreateRole(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateRole}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Create Role
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showEditRole && (
              <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Edit Role: {editingRole?.name}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                      <input
                        type="text"
                        value={editRole.name}
                        onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter role name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={editRole.description}
                        onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter role description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {Object.entries(permissionCategories).map(([category, perms]) => (
                          <div key={category}>
                            <h4 className="font-medium text-gray-800 mb-2">{category}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {perms.map((perm) => (
                                <label key={perm.id} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={editRole.permissions.includes(perm.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setEditRole({ ...editRole, permissions: [...editRole.permissions, perm.id] })
                                      } else {
                                        setEditRole({
                                          ...editRole,
                                          permissions: editRole.permissions.filter((p) => p !== perm.id),
                                        })
                                      }
                                    }}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                  />
                                  <span className="text-sm text-gray-700">{perm.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowEditRole(false)
                        setEditingRole(null)
                        setEditRole({ name: "", description: "", permissions: [] })
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateRole}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Update Role
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function RBACSettingsPage() {
  return (
    <AuthGuard allowedRoles={["IT/Admin"]}>
      <RBACSettingsContent />
    </AuthGuard>
  )
}