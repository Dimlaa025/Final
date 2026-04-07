// localStorage utility functions for We Care system

const STORAGE_KEYS = {
  USERS: "we_care_users",
  CURRENT_USER: "we_care_current_user",
  MEMBERS: "we_care_members",
  DEPENDENTS: "we_care_dependents",
  CLAIMS: "we_care_claims",
  AUDIT_LOGS: "we_care_audit_logs",
  NOTIFICATIONS: "we_care_notifications",
  DOCUMENTS: "we_care_documents",
  ROLES: "we_care_roles",
  PERMISSIONS: "we_care_permissions",
  ANNOUNCEMENTS: "we_care_announcements",
}

// Initialize default data
export function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers = [
      {
        id: "admin-001",
        email: "admin@wecare.com",
        password: "admin123",
        name: "Admin User",
        role: "IT/Admin",
        department: "IT",
        status: "active",
      },
      {
        id: "director-001",
        email: "director@wecare.com",
        password: "director123",
        name: "John Director",
        role: "Director",
        department: "Management",
        status: "active",
      },
      {
        id: "assistant-001",
        email: "assistant@wecare.com",
        password: "assistant123",
        name: "Sarah Assistant",
        role: "Assistant",
        department: "Claims",
        status: "active",
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers))
  }

  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    const defaultMembers = [
      {
        id: "member-002",
        name: "Sarah Johnson", 
        email: "sarah@wecare.com",
        department: "HR",
        status: "active",
        createdAt: new Date().toISOString(),
        mcbUsed: 0
      },
      {
        id: "member-003",
        name: "John Smith",
        email: "john@wecare.com", 
        department: "IT",
        status: "active",
        createdAt: new Date().toISOString(),
        mcbUsed: 0
      }
    ];
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(defaultMembers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.DEPENDENTS)) {
    localStorage.setItem(STORAGE_KEYS.DEPENDENTS, JSON.stringify([]))
  }

  if (!localStorage.getItem(STORAGE_KEYS.CLAIMS)) {
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify([]))
  }

  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]))
  }

  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]))
  }

  if (!localStorage.getItem(STORAGE_KEYS.PERMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify([
      { id: "user.edit", name: "Edit Users", category: "Users" },
      { id: "user.delete", name: "Delete Users", category: "Users" },
      { id: "user.view_all", name: "View All Users", category: "Users" },
      { id: "member.edit", name: "Edit Members", category: "Members" },
      { id: "member.view_all", name: "View All Members", category: "Members" },
      { id: "member.view_details", name: "View Member Details", category: "Members" },
      { id: "member.approve", name: "Approve Members", category: "Members" },
      { id: "member.reject", name: "Reject Members", category: "Members" },
      { id: "dependent.create", name: "Create Dependents", category: "Dependents" },
      { id: "dependent.edit", name: "Edit Dependents", category: "Dependents" },
      { id: "dependent.delete", name: "Delete Dependents", category: "Dependents" },
      { id: "dependent.view_all", name: "View All Dependents", category: "Dependents" },
      { id: "dependent.approve", name: "Approve Dependents", category: "Dependents" },
      { id: "dependent.reject", name: "Reject Dependents", category: "Dependents" },
      { id: "claim.create", name: "Create Claims", category: "Claims" },
      { id: "claim.edit", name: "Edit Claims", category: "Claims" },
      { id: "claim.delete", name: "Delete Claims", category: "Claims" },
      { id: "claim.view_all", name: "View All Claims", category: "Claims" },
      { id: "claim.view_own", name: "View Own Claims", category: "Claims" },
      { id: "claim.approve", name: "Approve Claims", category: "Claims" },
      { id: "claim.reject", name: "Reject Claims", category: "Claims" },
      { id: "claim.void", name: "Void Claims", category: "Claims" },
      { id: "claim.submit", name: "Submit Claims", category: "Claims" },
      { id: "document.upload", name: "Upload Documents", category: "Documents" },
      { id: "document.view", name: "View Documents", category: "Documents" },
      { id: "document.delete", name: "Delete Documents", category: "Documents" },
      { id: "report.view", name: "View Reports", category: "Reports" },
      { id: "report.export", name: "Export Reports", category: "Reports" },
      { id: "audit.view", name: "View Audit Logs", category: "Audit" },
      { id: "system.settings", name: "System Settings", category: "System" },
      { id: "role.manage", name: "Manage Roles", category: "System" },
      { id: "announcement.create", name: "Create Announcements", category: "Announcements" },
      { id: "announcement.edit", name: "Edit Announcements", category: "Announcements" },
      { id: "announcement.delete", name: "Delete Announcements", category: "Announcements" },
      { id: "announcement.view", name: "View Announcements", category: "Announcements" },
      { id: "announcement.manage", name: "Manage Announcements", category: "Announcements" },
      { id: "analytics.view", name: "View Analytics", category: "Analytics" },
      { id: "analytics.export", name: "Export Analytics", category: "Analytics" },
    ]))
  }

  if (!localStorage.getItem(STORAGE_KEYS.ROLES)) {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify([
      {
        id: "IT/Admin",
        name: "IT/Admin",
        description: "Full system access",
        permissions: [
          "user.edit", "user.delete", "user.view_all",
          "member.edit", "member.view_all", "member.approve", "member.reject",
          "dependent.create", "dependent.edit", "dependent.delete", "dependent.view_all", "dependent.approve", "dependent.reject",
          "claim.create", "claim.edit", "claim.delete", "claim.view_all", "claim.approve", "claim.reject", "claim.void", "claim.submit",
          "document.upload", "document.view", "document.delete",
          "report.view", "report.export", "audit.view", "system.settings", "role.manage",
          "announcement.create", "announcement.edit", "announcement.delete", "announcement.view", "announcement.manage",
          "analytics.view", "analytics.export"
        ],
        isSystem: true,
        status: "active",
      },
      {
        id: "Director",
        name: "Director",
        description: "Approval and reporting access",
        permissions: [
          "member.view_all", "dependent.view_all", "claim.view_all", "claim.approve", "claim.reject", "claim.void",
          "document.view", "report.view", "report.export", "audit.view", "analytics.view"
        ],
        isSystem: true,
        status: "active",
      },
      {
        id: "Assistant",
        name: "Assistant",
        description: "Claims and member management",
        permissions: [
          "member.edit", "member.view_all", "member.approve", "member.reject",
          "dependent.create", "dependent.edit", "dependent.delete", "dependent.view_all",
          "claim.create", "claim.edit", "claim.submit", "claim.view_all",
          "document.upload", "document.view", "document.delete"
        ],
        isSystem: true,
        status: "active",
      },
      {
        id: "Member",
        name: "Member",
        description: "Personal claims and dependents",
        permissions: ["claim.view_own", "dependent.view_own"],
        isSystem: true,
        status: "active",
      },
    ]))
  } else {
    // Update existing roles if missing analytics.view permission for Director
    const roles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROLES) || "[]")
    const directorRole = roles.find(r => r.id === "Director")
    if (directorRole && !directorRole.permissions.includes("analytics.view")) {
      directorRole.permissions.push("analytics.view")
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles))
    }
  }
}

// User authentication
export function loginUser(email, password) {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]")
  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    if (user.status === "pending") {
      return { error: "Your account is pending approval by an administrator. Please try again later." }
    }
    if (user.status !== "active") {
      return { error: "Your account is not active. Please contact an administrator." }
    }
    const { password: _, ...userWithoutPassword } = user
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword))
    addAuditLog("LOGIN", `User ${user.name} logged in`, user.id)
    return userWithoutPassword
  }
  return null
}

export function registerUser(userData) {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]")
  if (users.find((u) => u.email === userData.email)) {
    return { error: "Email already exists" }
  }
  const newUser = {
    id: `user-${Date.now()}`,
    ...userData,
    status: userData.status || "pending",
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))

  // Notify admins
  const admins = users.filter(u => u.role === "IT/Admin" && u.status === "active")
  admins.forEach(admin => {
    addNotification(admin.id, `New user registration: ${userData.name} (${userData.email}) requires approval`, "info")
  })

  addAuditLog("REGISTER", `New user ${userData.name} registered (pending approval)`, newUser.id)
  return newUser
}

export function logoutUser() {
  const currentUser = getCurrentUser()
  if (currentUser) {
    addAuditLog("LOGOUT", `User ${currentUser.name} logged out`, currentUser.id)
  }
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || "null")
}

export function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]")
}

export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

// NEW: Update user status for approvals
export function updateUserStatus(userId, newStatus) {
  const users = getUsers()
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex !== -1) {
    users[userIndex].status = newStatus
    saveUsers(users)
    addAuditLog("USER_STATUS_UPDATE", `User ${users[userIndex].name} status updated to ${newStatus}`, getCurrentUser()?.id)
    return users[userIndex]
  }
  return null
}

// Member management
export function addMember(memberData) {
  const members = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || "[]")
  const currentUser = getCurrentUser()

  // Check for duplicates by email or memberId
  const existingMember = members.find(m => m.email === memberData.email || m.id === memberData.id)
  if (existingMember) {
    // Update existing member instead of creating duplicate
    const updatedMember = { ...existingMember, ...memberData, updatedAt: new Date().toISOString() }
    const index = members.findIndex(m => m.id === existingMember.id)
    members[index] = updatedMember
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members))

    if (currentUser) {
      addAuditLog("MEMBER_UPDATED", `Member ${updatedMember.name} (${updatedMember.id}) updated by ${currentUser.name} - Department: ${updatedMember.department}, Email: ${updatedMember.email}`, currentUser.id)
    }
    return updatedMember
  }

  const newMember = {
    id: memberData.id || `member-${Date.now()}`,
    ...memberData,
    createdAt: new Date().toISOString(),
    status: "active",
  }
  members.push(newMember)
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members))

  if (currentUser) {
    addAuditLog("MEMBER_CREATED", `Member ${newMember.name} (${newMember.id}) created by ${currentUser.name} - Department: ${newMember.department}, Email: ${newMember.email}`, currentUser.id)
  }
  return newMember
}

export function createMember(memberData) {
  const members = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || "[]")

  // Check for duplicates by email or memberId
  const existingMember = members.find(m => m.email === memberData.email || m.id === memberData.id)
  if (existingMember) {
    // Update existing member instead of creating duplicate
    const updatedMember = { ...existingMember, ...memberData, updatedAt: new Date().toISOString() }
    const index = members.findIndex(m => m.id === existingMember.id)
    members[index] = updatedMember
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members))
    return updatedMember
  }

  const newMember = {
    id: memberData.id || `member-${Date.now()}`,
    ...memberData,
    createdAt: new Date().toISOString(),
    status: "active",
  }
  members.push(newMember)
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members))
  return newMember
}

export function getMembers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || "[]")
}

export function getMemberById(id) {
  return getMembers().find(m => m.id === id)
}

export function getMemberByUserId(userId) {
  return getMembers().find(m => m.userId === userId)
}

export function deleteMember(id) {
  const members = getMembers()
  const memberToDelete = members.find(m => m.id === id)
  const updatedMembers = members.filter(m => m.id !== id)
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updatedMembers))

  const currentUser = getCurrentUser()
  if (currentUser && memberToDelete) {
    addAuditLog("MEMBER_DELETED", `Member ${memberToDelete.name} (${memberToDelete.id}) deleted by ${currentUser.name} - Department: ${memberToDelete.department}, Email: ${memberToDelete.email}`, currentUser.id)
  }
}

export function searchMembers(query, filters = {}) {
  let members = getMembers()

  // Text search
  if (query) {
    const lowerQuery = query.toLowerCase()
    members = members.filter(member => {
      return (
        member.id.toLowerCase().includes(lowerQuery) ||
        member.name.toLowerCase().includes(lowerQuery) ||
        member.email.toLowerCase().includes(lowerQuery) ||
        member.department.toLowerCase().includes(lowerQuery) ||
        member.status.toLowerCase().includes(lowerQuery)
      )
    })
  }

  // Apply filters
  if (filters.status) {
    members = members.filter(m => m.status === filters.status)
  }
  if (filters.department) {
    members = members.filter(m => m.department === filters.department)
  }
  if (filters.dateFrom) {
    members = members.filter(m => new Date(m.createdAt) >= new Date(filters.dateFrom))
  }
  if (filters.dateTo) {
    members = members.filter(m => new Date(m.createdAt) <= new Date(filters.dateTo))
  }

  return members
}

// Dependent management
export function createDependent(dependentData) {
  const dependents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPENDENTS) || "[]")
  if (dependents.filter(d => d.memberId === dependentData.memberId).length >= 4) {
    throw new Error("Member cannot have more than 4 dependents")
  }
  const newDependent = {
    id: `dependent-${Date.now()}`,
    ...dependentData,
    createdAt: new Date().toISOString(),
    status: dependentData.status || "active",
  }
  dependents.push(newDependent)
  localStorage.setItem(STORAGE_KEYS.DEPENDENTS, JSON.stringify(dependents))

  const currentUser = getCurrentUser()
  if (currentUser) {
    const member = getMemberById(dependentData.memberId)
    if (member) {
      addAuditLog("DEPENDENT_CREATED", `Dependent ${newDependent.name} (${newDependent.relationship}) added for member ${member.name} (${dependentData.memberId}) - Status: ${newDependent.status}`, currentUser.id)
    }
  }
  return newDependent
}

export function getDependents() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPENDENTS) || "[]")
}

export function getDependentsByMember(memberId) {
  return getDependents().filter(d => d.memberId === memberId)
}

export function getDependentsByMemberId(memberId) {
  return getDependentsByMember(memberId)
}

export function deleteDependent(id) {
  const dependents = getDependents()
  const dependent = dependents.find(d => d.id === id)
  const updatedDependents = dependents.filter(d => d.id !== id)
  localStorage.setItem(STORAGE_KEYS.DEPENDENTS, JSON.stringify(updatedDependents))

  const currentUser = getCurrentUser()
  if (currentUser && dependent) {
    const member = getMemberById(dependent.memberId)
    if (member) {
      addAuditLog("DEPENDENT_DELETED", `Dependent ${dependent.name} (${dependent.relationship}) deleted from member ${member.name} (${dependent.memberId})`, currentUser.id)
    }
  }
}

export function addDependent(dependentData) {
  return createDependent(dependentData)
}

export function updateDependent(id, updates) {
  const dependents = getDependents()
  const index = dependents.findIndex(d => d.id === id)
  if (index !== -1) {
    dependents[index] = { ...dependents[index], ...updates, updatedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEYS.DEPENDENTS, JSON.stringify(dependents))
    return dependents[index]
  }
  return null
}

export function searchDependents(query, filters = {}) {
  let dependents = getDependents()

  // Text search
  if (query) {
    const lowerQuery = query.toLowerCase()
    dependents = dependents.filter(dependent => {
      const member = getMemberById(dependent.memberId)
      return (
        dependent.id.toLowerCase().includes(lowerQuery) ||
        dependent.name.toLowerCase().includes(lowerQuery) ||
        dependent.relationship.toLowerCase().includes(lowerQuery) ||
        dependent.status.toLowerCase().includes(lowerQuery) ||
        (member && member.name.toLowerCase().includes(lowerQuery))
      )
    })
  }

  // Apply filters
  if (filters.status) {
    dependents = dependents.filter(d => d.status === filters.status)
  }
  if (filters.relationship) {
    dependents = dependents.filter(d => d.relationship === filters.relationship)
  }
  if (filters.memberId) {
    dependents = dependents.filter(d => d.memberId === filters.memberId)
  }
  if (filters.dateFrom) {
    dependents = dependents.filter(d => new Date(d.createdAt) >= new Date(filters.dateFrom))
  }
  if (filters.dateTo) {
    dependents = dependents.filter(d => new Date(d.createdAt) <= new Date(filters.dateTo))
  }

  return dependents
}

// Claims management
// Claims management
export function createClaim(claimData) {
  const claims = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIMS) || "[]")

  // FIX: Check if we are passing an existing ID (to prevent double-submissions)
  // If no ID is provided in claimData, only then do we create a new one
  const claimId = claimData.id || `claim-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  
  // Check if this ID already exists in our storage
  const existingIndex = claims.findIndex(c => c.id === claimId);

  const newClaim = {
    id: claimId,
    ...claimData,
    status: claimData.status || "submitted",
    createdAt: claimData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (existingIndex > -1) {
    // If it exists, update the existing entry instead of adding a new one
    claims[existingIndex] = newClaim;
  } else {
    // If it's truly new, push it to the list
    claims.push(newClaim);
  }

  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims))
  return newClaim
}

export function getClaims() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIMS) || "[]")
}

export function getClaimById(id) {
  return getClaims().find(c => c.id === id)
}

export function getClaimsByMember(memberId) {
  return getClaims().filter(c => c.memberId === memberId)
}

export function getClaimsByMemberId(memberId) {
  return getClaimsByMember(memberId)
}

export function updateClaim(id, updates) {
  const claims = getClaims()

  let wasUpdated = false

  const updatedClaims = claims.map((claim) => {
    if (claim.id === id) {
      wasUpdated = true
      return {
        ...claim,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    }
    return claim
  })

  if (wasUpdated) {
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updatedClaims))
    return updatedClaims.find((claim) => claim.id === id) || null
  }

  return null
}

export function deleteClaim(id) {
  const claims = getClaims().filter(c => c.id !== id)
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims))
}

export function searchClaims(query, filters = {}) {
  let claims = getClaims()

  // Text search
  if (query) {
    const lowerQuery = query.toLowerCase()
    claims = claims.filter(claim => {
      const member = getMemberById(claim.memberId)
      return (
        claim.id.toLowerCase().includes(lowerQuery) ||
        claim.claimType.toLowerCase().includes(lowerQuery) ||
        claim.status.toLowerCase().includes(lowerQuery) ||
        (member && member.name.toLowerCase().includes(lowerQuery))
      )
    })
  }

  // Apply filters
  if (filters.status) {
    claims = claims.filter(c => c.status === filters.status)
  }
  if (filters.claimType) {
    claims = claims.filter(c => c.claimType === filters.claimType)
  }
  if (filters.dateFrom) {
    claims = claims.filter(c => new Date(c.createdAt) >= new Date(filters.dateFrom))
  }
  if (filters.dateTo) {
    claims = claims.filter(c => new Date(c.createdAt) <= new Date(filters.dateTo))
  }
  if (filters.amountMin) {
    claims = claims.filter(c => parseFloat(c.amount) >= parseFloat(filters.amountMin))
  }
  if (filters.amountMax) {
    claims = claims.filter(c => parseFloat(c.amount) <= parseFloat(filters.amountMax))
  }

  return claims
}

export function approveClaim(id, approverId, comments = "") {
  const claim = updateClaim(id, {
    status: "approved",
    approvedBy: approverId,
    approvedAt: new Date().toISOString(),
    comments,
  })
  addAuditLog("CLAIM_APPROVED", `Claim ${id.slice(-8)} approved`, approverId)
  return claim
}

export function rejectClaim(id, approverId, comments = "") {
  const claim = updateClaim(id, {
    status: "rejected",
    rejectedBy: approverId,
    rejectedAt: new Date().toISOString(),
    comments,
  })
  addAuditLog("CLAIM_REJECTED", `Claim ${id.slice(-8)} rejected`, approverId)
  return claim
}

export function voidClaim(id, voiderId, comments = "") {
  const claim = updateClaim(id, {
    status: "voided",
    voidedBy: voiderId,
    voidedAt: new Date().toISOString(),
    comments,
  })
  addAuditLog("CLAIM_VOIDED", `Claim ${id.slice(-8)} voided`, voiderId)
  return claim
}

export function getPendingClaims() {
  const claims = getClaims().filter(c => c.status === "submitted" || c.status === "pending-approval")
  // Remove duplicates based on claim ID to ensure unique keys
  const uniqueClaims = claims.filter((claim, index, self) =>
    index === self.findIndex((c) => c.id === claim.id)
  )
  return uniqueClaims
}

// Document management
export function uploadDocument(claimId, fileData) {
  if (fileData.fileSize > 5242880) {
    throw new Error("File size exceeds 5MB limit")
  }
  if (!["application/pdf", "image/jpeg", "image/png", "image/gif"].includes(fileData.fileType)) {
    throw new Error("Invalid file type. Only PDF and images (JPEG, PNG, GIF) are allowed.")
  }
  if (!fileData.base64Data || !/^data:[a-zA-Z]+\/[a-zA-Z]+;base64,/.test(fileData.base64Data)) {
    throw new Error("Invalid file data format")
  }

  const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || "[]")
  const newDocument = {
    id: `doc-${Date.now()}`,
    claimId,
    fileName: fileData.fileName,
    fileType: fileData.fileType,
    fileSize: fileData.fileSize,
    base64Data: fileData.base64Data,
    uploadedBy: fileData.uploadedBy,
    uploadedAt: new Date().toISOString(),
  }
  documents.push(newDocument)
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents))
  return newDocument
}

export function getDocumentsByClaim(claimId) {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || "[]").filter(d => d.claimId === claimId)
}

export function deleteDocument(id) {
  const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || "[]").filter(d => d.id !== id)
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents))
}

// Filters
export function saveFilters(filters) {
  localStorage.setItem("weCare_filters", JSON.stringify(filters))
}

export function getFilters() {
  return JSON.parse(localStorage.getItem("weCare_filters") || "{}")
}

export function saveFilterState(state) {
  localStorage.setItem("weCare_filter_state", JSON.stringify(state))
}

export function getFilterState() {
  return JSON.parse(localStorage.getItem("weCare_filter_state") || "{}")
}

// Audit logging
export function addAuditLog(action, description, userId) {
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || "[]")
  const log = {
    id: `log-${Date.now()}`,
    action,
    description,
    userId,
    timestamp: new Date().toISOString(),
  }
  logs.push(log)
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs))
}

export function getAuditLogs() {
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || "[]")
  // Remove duplicates based on log ID to ensure unique keys
  const uniqueLogs = logs.filter((log, index, self) =>
    index === self.findIndex((l) => l.id === log.id)
  )
  return uniqueLogs
}

// Notifications
export function addNotification(userId, message, type = "info") {
  const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || "[]")
  const notification = {
    id: `notif-${Date.now()}`,
    userId,
    message,
    type,
    read: false,
    timestamp: new Date().toISOString(),
  }
  notifications.push(notification)
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
}

export function getNotifications(userId) {
  const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || "[]")
  return notifications.filter(n => n.userId === userId)
}

export function markNotificationAsRead(notificationId) {
  const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || "[]")
  const notification = notifications.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
  }
}

export function markAllNotificationsAsRead(userId) {
  const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || "[]")
  const userNotifications = notifications.filter(n => n.userId === userId)
  userNotifications.forEach(n => n.read = true)
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
}

export { STORAGE_KEYS }

// Permission utility functions
export function getRoles() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ROLES) || "[]")
}

export function getPermissions() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PERMISSIONS) || "[]")
}

export function createRole(roleData) {
  const roles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROLES) || "[]")
  const newRole = {
    id: roleData.id,
    name: roleData.name,
    description: roleData.description,
    permissions: roleData.permissions || [],
    isSystem: false,
    status: "active",
  }
  roles.push(newRole)
  localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles))
  return newRole
}

export function updateRole(roleId, updates) {
  const roles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROLES) || "[]")
  const roleIndex = roles.findIndex(r => r.id === roleId)
  if (roleIndex !== -1) {
    roles[roleIndex] = { ...roles[roleIndex], ...updates }
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles))
    return roles[roleIndex]
  }
  return null
}

export function deleteRole(roleId) {
  const roles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROLES) || "[]")
  const filteredRoles = roles.filter(r => r.id !== roleId)
  localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(filteredRoles))
}

export function getUserPermissions(user) {
  if (!user || !user.role) {
    return []
  }
  const roles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROLES) || "[]")
  const userRole = roles.find(r => r.id === user.role)
  return userRole ? userRole.permissions : []
}

export function hasPermission(user, permission) {
  const permissions = getUserPermissions(user)
  return permissions.includes(permission)
}

export function canUserAccess(user, permissions) {
  const userPerms = getUserPermissions(user)
  return permissions.some(p => userPerms.includes(p))
}

// User password management
export function changeUserRole(userId, newRole) {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]")
  const userIndex = users.findIndex(u => u.id === userId)

  if (userIndex === -1) {
    return { error: "User not found" }
  }

  const user = users[userIndex]
  const oldRole = user.role

  // Update role
  users[userIndex].role = newRole
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))

  addAuditLog("ROLE_CHANGE", `Role changed from ${oldRole} to ${newRole} for user ${user.name}`, userId)

  return users[userIndex]
}

export function resetUserPassword(userId) {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]")
  const userIndex = users.findIndex(u => u.id === userId)

  if (userIndex === -1) {
    return { error: "User not found" }
  }

  const user = users[userIndex]
  const newPassword = "TempPass123!"

  // Reset password to temporary password
  users[userIndex].password = newPassword
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))

  addAuditLog("PASSWORD_RESET", `Password reset for user ${user.name}`, userId)

  return { success: true, tempPassword: newPassword }
}

export function changePassword(userId, currentPassword, newPassword) {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]")
  const userIndex = users.findIndex(u => u.id === userId)

  if (userIndex === -1) {
    return { error: "User not found" }
  }

  const user = users[userIndex]

  // Verify current password
  if (user.password !== currentPassword) {
    return { error: "Current password is incorrect" }
  }

  // Validate new password strength
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters long" }
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
    return { error: "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" }
  }

  // Update password
  users[userIndex].password = newPassword
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))

  addAuditLog("PASSWORD_CHANGE", `Password changed for user ${user.name}`, userId)

  return { success: true }
}

// Announcements management
export function getAnnouncements() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS) || "[]")
}

export function addAnnouncement(title, message, priority = "normal", expiresAt = null) {
  const announcements = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS) || "[]")
  const currentUser = getCurrentUser()
  const newAnnouncement = {
    id: `announcement-${Date.now()}`,
    title,
    message,
    priority,
    expiresAt,
    createdAt: new Date().toISOString(),
  }
  announcements.push(newAnnouncement)
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements))

  if (currentUser) {
    addAuditLog("ANNOUNCEMENT_CREATED", `Announcement "${title}" created by ${currentUser.name} - Priority: ${priority}${expiresAt ? `, Expires: ${new Date(expiresAt).toLocaleString()}` : ', No expiration'}`, currentUser.id)
  }
  return newAnnouncement
}

export function createAnnouncement(announcementData) {
  const announcements = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS) || "[]")
  const newAnnouncement = {
    id: `announcement-${Date.now()}`,
    ...announcementData,
    createdAt: new Date().toISOString(),
  }
  announcements.push(newAnnouncement)
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements))
  return newAnnouncement
}

export function updateAnnouncement(id, updates) {
  const announcements = getAnnouncements()
  const index = announcements.findIndex(a => a.id === id)
  if (index !== -1) {
    const originalAnnouncement = announcements[index]
    announcements[index] = { ...announcements[index], ...updates }
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements))

    const currentUser = getCurrentUser()
    if (currentUser) {
      const changes = []
      if (updates.title && updates.title !== originalAnnouncement.title) {
        changes.push(`title from "${originalAnnouncement.title}" to "${updates.title}"`)
      }
      if (updates.message && updates.message !== originalAnnouncement.message) {
        changes.push('message')
      }
      if (updates.priority && updates.priority !== originalAnnouncement.priority) {
        changes.push(`priority from ${originalAnnouncement.priority} to ${updates.priority}`)
      }
      if (updates.expiresAt !== originalAnnouncement.expiresAt) {
        changes.push(`expiration ${originalAnnouncement.expiresAt ? 'updated' : 'set'}`)
      }

      addAuditLog("ANNOUNCEMENT_UPDATED", `Announcement "${originalAnnouncement.title}" updated by ${currentUser.name}${changes.length > 0 ? ` - Changes: ${changes.join(', ')}` : ''}`, currentUser.id)
    }
    return announcements[index]
  }
  return null
}

export function deleteAnnouncement(id) {
  const announcements = getAnnouncements()
  const announcementToDelete = announcements.find(a => a.id === id)
  const updatedAnnouncements = announcements.filter(a => a.id !== id)
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updatedAnnouncements))

  const currentUser = getCurrentUser()
  if (currentUser && announcementToDelete) {
    addAuditLog("ANNOUNCEMENT_DELETED", `Announcement "${announcementToDelete.title}" deleted by ${currentUser.name} - Priority: ${announcementToDelete.priority}`, currentUser.id)
  }
}

// Analytics data aggregation functions
export function getMCBAnalytics(user, dateRange = 30) {
  const claims = getClaims()
  const members = getMembers()

  // Filter claims based on user permissions
  let filteredClaims = claims
  if (user.role === "Member") {
    filteredClaims = claims.filter(c => c.memberId === user.id)
  } else if (user.role === "Assistant") {
    // Assistants can see claims from their department
    const userRecord = getUsers().find(u => u.id === user.id)
    if (userRecord) {
      filteredClaims = claims.filter(c => {
        const member = members.find(m => m.id === c.memberId)
        return member && member.department === userRecord.department
      })
    }
  }

  // Only include approved claims in calculations
  filteredClaims = filteredClaims.filter(c => c.status === 'approved')

  // Filter by date range
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - dateRange)
  filteredClaims = filteredClaims.filter(c => new Date(c.createdAt) >= cutoffDate)

  const MCB_LIMIT = 150000
  const totalClaimed = filteredClaims.reduce((sum, c) => sum + parseFloat(c.amount), 0)
  const remaining = MCB_LIMIT - totalClaimed

  return {
    totalClaimed,
    remaining: Math.max(0, remaining),
    mcbLimit: MCB_LIMIT,
    utilizationRate: (totalClaimed / MCB_LIMIT) * 100
  }
}

export function getMonthlyClaimsTrend(user, months = 12) {
  const claims = getClaims()
  const members = getMembers()

  // Filter claims based on user permissions
  let filteredClaims = claims
  if (user.role === "Member") {
    filteredClaims = claims.filter(c => c.memberId === user.id)
  } else if (user.role === "Assistant") {
    const userRecord = getUsers().find(u => u.id === user.id)
    if (userRecord) {
      filteredClaims = claims.filter(c => {
        const member = members.find(m => m.id === c.memberId)
        return member && member.department === userRecord.department
      })
    }
  }

  // Only include approved claims in calculations
  filteredClaims = filteredClaims.filter(c => c.status === 'approved')

  const trendData = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

    const monthClaims = filteredClaims.filter(c => {
      const claimDate = new Date(c.createdAt)
      return claimDate >= monthStart && claimDate <= monthEnd
    })

    const submitted = monthClaims.length
    const approved = monthClaims.filter(c => c.status === "approved").length

    trendData.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      submitted,
      approved
    })
  }

  return trendData
}

export function getClaimsByDepartment(user) {
  const claims = getClaims()
  const members = getMembers()

  // Filter claims based on user permissions
  let filteredClaims = claims
  if (user.role === "Member") {
    filteredClaims = claims.filter(c => c.memberId === user.id)
  } else if (user.role === "Assistant") {
    const userRecord = getUsers().find(u => u.id === user.id)
    if (userRecord) {
      filteredClaims = claims.filter(c => {
        const member = members.find(m => m.id === c.memberId)
        return member && member.department === userRecord.department
      })
    }
  }

  // Only include approved claims in calculations
  filteredClaims = filteredClaims.filter(c => c.status === 'approved')

  const departmentData = {}
  filteredClaims.forEach(claim => {
    const member = members.find(m => m.id === claim.memberId)
    if (member) {
      const dept = member.department
      if (!departmentData[dept]) {
        departmentData[dept] = { count: 0, totalAmount: 0 }
      }
      departmentData[dept].count++
      departmentData[dept].totalAmount += parseFloat(claim.amount)
    }
  })

  return Object.entries(departmentData).map(([department, data]) => ({
    department,
    count: data.count,
    totalAmount: data.totalAmount
  }))
}

export function getClaimsByProcedure(user) {
  const claims = getClaims()
  const members = getMembers()

  // Filter claims based on user permissions
  let filteredClaims = claims
  if (user.role === "Member") {
    filteredClaims = claims.filter(c => c.memberId === user.id)
  } else if (user.role === "Assistant") {
    const userRecord = getUsers().find(u => u.id === user.id)
    if (userRecord) {
      filteredClaims = claims.filter(c => {
        const member = members.find(m => m.id === c.memberId)
        return member && member.department === userRecord.department
      })
    }
  }

  // Only include approved claims in calculations
  filteredClaims = filteredClaims.filter(c => c.status === 'approved')

  const procedureData = {}
  filteredClaims.forEach(claim => {
    const procedure = claim.procedure || 'Unknown'
    if (!procedureData[procedure]) {
      procedureData[procedure] = 0
    }
    procedureData[procedure]++
  })

  const total = Object.values(procedureData).reduce((sum, count) => sum + count, 0)
  return Object.entries(procedureData).map(([procedure, count]) => ({
    procedure,
    count,
    percentage: (count / total) * 100
  }))

}

export function getClaimsByDiagnosis(user) {
  const claims = getClaims()
  const members = getMembers()

  // Filter claims based on user permissions
  let filteredClaims = claims
  if (user.role === "Member") {
    filteredClaims = claims.filter(c => c.memberId === user.id)
  } else if (user.role === "Assistant") {
    const userRecord = getUsers().find(u => u.id === user.id)
    if (userRecord) {
      filteredClaims = claims.filter(c => {
        const member = members.find(m => m.id === c.memberId)
        return member && member.department === userRecord.department
      })
    }
  }

  // Only include approved claims in calculations
  filteredClaims = filteredClaims.filter(c => c.status === 'approved')

  const diagnosisData = {}
  filteredClaims.forEach(claim => {
    const diagnosis = claim.diagnosis || 'Unknown'
    if (!diagnosisData[diagnosis]) {
      diagnosisData[diagnosis] = 0
    }
    diagnosisData[diagnosis]++
  })

  const total = Object.values(diagnosisData).reduce((sum, count) => sum + count, 0)
  return Object.entries(diagnosisData).map(([diagnosis, count]) => ({
    diagnosis,
    count,
    percentage: (count / total) * 100
  }))

}

export function getClaimsByType(user) {
  const claims = getClaims()
  const members = getMembers()

  // Filter claims based on user permissions
  let filteredClaims = claims
  if (user.role === "Member") {
    filteredClaims = claims.filter(c => c.memberId === user.id)
  } else if (user.role === "Assistant") {
    const userRecord = getUsers().find(u => u.id === user.id)
    if (userRecord) {
      filteredClaims = claims.filter(c => {
        const member = members.find(m => m.id === c.memberId)
        return member && member.department === userRecord.department
      })
    }
  }

  // Only include approved claims in calculations
  filteredClaims = filteredClaims.filter(c => c.status === 'approved')

  const typeData = {}
  filteredClaims.forEach(claim => {
    const type = claim.claimType
    if (!typeData[type]) {
      typeData[type] = 0
    }
    typeData[type]++
  })

  const total = Object.values(typeData).reduce((sum, count) => sum + count, 0)
  return Object.entries(typeData).map(([type, count]) => ({
    type,
    count,
    percentage: (count / total) * 100
  }))
}

export function getClaimsByDependentRelationship(user) {
  const claims = getClaims()
  const dependents = getDependents()
  const members = getMembers()

  let filteredClaims = claims
  if (user.role === "Member") {
    filteredClaims = claims.filter((c) => c.memberId === user.id)
  } else if (user.role === "Assistant") {
    const userRecord = getUsers().find((u) => u.id === user.id)
    if (userRecord) {
      filteredClaims = claims.filter((c) => {
        const member = members.find((m) => m.id === c.memberId)
        return member && member.department === userRecord.department
      })
    }
  }

  filteredClaims = filteredClaims.filter((c) => c.status === "approved")

  const dependentIds = new Set(dependents.map((d) => d.id))
  const relationshipData = {}

  filteredClaims.forEach((claim) => {
    const resolvedDependentId =
      claim.dependentId || (dependentIds.has(claim.memberId) ? claim.memberId : null)

    if (!resolvedDependentId) return

    const dependent = dependents.find((d) => d.id === resolvedDependentId)
    if (!dependent) return

    const relationship = dependent.relationship || "Unknown"
    if (!relationshipData[relationship]) {
      relationshipData[relationship] = 0
    }
    relationshipData[relationship]++
  })

  const total = Object.values(relationshipData).reduce((sum, count) => sum + count, 0)

  return Object.entries(relationshipData).map(([relationship, count]) => ({
    relationship,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  }))
}

export function getMemberVsDependentClaims(user) {
  const claims = getClaims()
  const dependents = getDependents()
  const members = getMembers()

  let filteredClaims = claims
  if (user.role === "Member") {
    filteredClaims = claims.filter((c) => c.memberId === user.id)
  } else if (user.role === "Assistant") {
    const userRecord = getUsers().find((u) => u.id === user.id)
    if (userRecord) {
      filteredClaims = claims.filter((c) => {
        const member = members.find((m) => m.id === c.memberId)
        return member && member.department === userRecord.department
      })
    }
  }

  filteredClaims = filteredClaims.filter((c) => c.status === "approved")

  const dependentIds = new Set(dependents.map((d) => d.id))

  const memberClaims = filteredClaims.filter(
    (c) => !c.dependentId && !dependentIds.has(c.memberId)
  )

  const dependentClaims = filteredClaims.filter(
    (c) => c.dependentId || dependentIds.has(c.memberId)
  )

  return {
    member: {
      count: memberClaims.length,
      totalAmount: memberClaims.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0),
    },
    dependent: {
      count: dependentClaims.length,
      totalAmount: dependentClaims.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0),
    },
  }
}

export function getTopClaimants(user, limit = 10) {
  const claims = getClaims()
  const members = getMembers()

  // Filter claims based on user permissions
  let filteredClaims = claims
  if (user.role === "Member") {
    filteredClaims = claims.filter(c => c.memberId === user.id)
  } else if (user.role === "Assistant") {
    const userRecord = getUsers().find(u => u.id === user.id)
    if (userRecord) {
      filteredClaims = claims.filter(c => {
        const member = members.find(m => m.id === c.memberId)
        return member && member.department === userRecord.department
      })
    }
  }

  // Only include approved claims in calculations
  filteredClaims = filteredClaims.filter(c => c.status === 'approved')

  const claimantData = {}
  filteredClaims.forEach(claim => {
    const member = members.find(m => m.id === claim.memberId)
    if (member) {
      const key = member.id
      if (!claimantData[key]) {
        claimantData[key] = { name: member.name, totalAmount: 0, claimCount: 0 }
      }
      claimantData[key].totalAmount += parseFloat(claim.amount)
      claimantData[key].claimCount++
    }
  })

  return Object.values(claimantData)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit)
}



