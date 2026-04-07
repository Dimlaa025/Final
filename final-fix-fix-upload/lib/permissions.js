// Permission utility functions for RBAC enforcement
import { hasPermission, canUserAccess, getUserPermissions } from "./storage"

// Check if user has a specific permission
export function checkPermission(user, permission) {
  return hasPermission(user, permission)
}

// Check if user has any of the required permissions
export function checkAnyPermission(user, permissions) {
  return canUserAccess(user, permissions)
}

// Check if user has all required permissions
export function checkAllPermissions(user, permissions) {
  if (!Array.isArray(permissions)) {
    permissions = [permissions]
  }
  return permissions.every(permission => hasPermission(user, permission))
}

// Get all permissions for a user
export function getPermissions(user) {
  return getUserPermissions(user)
}

// Permission constants for easy reference
export const PERMISSIONS = {
  // User management (no create - self register)
  USER_EDIT: "user.edit",
  USER_DELETE: "user.delete",
  USER_VIEW_ALL: "user.view_all",

  // Member management
  MEMBER_EDIT: "member.edit",
  MEMBER_VIEW_ALL: "member.view_all",
  MEMBER_VIEW_DETAILS: "member.view_details",
  MEMBER_APPROVE: "member.approve", // NEW: Permission to approve registrations
  MEMBER_REJECT: "member.reject",   // NEW: Permission to reject registrations

  // Dependent management
  DEPENDENT_CREATE: "dependent.create",
  DEPENDENT_EDIT: "dependent.edit",
  DEPENDENT_DELETE: "dependent.delete",
  DEPENDENT_VIEW_ALL: "dependent.view_all",
  DEPENDENT_VIEW_OWN: "dependent.view_own",
  DEPENDENT_APPROVE: "dependent.approve",
  DEPENDENT_REJECT: "dependent.reject",

  // Claims management
  CLAIM_CREATE: "claim.create",
  CLAIM_EDIT: "claim.edit",
  CLAIM_DELETE: "claim.delete",
  CLAIM_VIEW_ALL: "claim.view_all",
  CLAIM_VIEW_OWN: "claim.view_own",
  CLAIM_APPROVE: "claim.approve",
  CLAIM_REJECT: "claim.reject",
  CLAIM_VOID: "claim.void",
  CLAIM_SUBMIT: "claim.submit",

  // Documents
  DOCUMENT_UPLOAD: "document.upload",
  DOCUMENT_VIEW: "document.view",
  DOCUMENT_DELETE: "document.delete",

  // Reports
  REPORT_VIEW: "report.view",
  REPORT_EXPORT: "report.export",

  // Audit
  AUDIT_VIEW: "audit.view",

  // System
  SYSTEM_SETTINGS: "system.settings",
  ROLE_MANAGE: "role.manage",

  // Announcements
  ANNOUNCEMENT_CREATE: "announcement.create",
  ANNOUNCEMENT_EDIT: "announcement.edit",
  ANNOUNCEMENT_DELETE: "announcement.delete",
  ANNOUNCEMENT_VIEW: "announcement.view",
  ANNOUNCEMENT_MANAGE: "announcement.manage",

  // Analytics
  ANALYTICS_VIEW: "analytics.view",
  ANALYTICS_EXPORT: "analytics.export",
}

// Permission groups for common checks
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: [
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_VIEW_ALL,
  ],
  MEMBER_MANAGEMENT: [
    PERMISSIONS.MEMBER_EDIT,
    PERMISSIONS.MEMBER_VIEW_ALL,
    PERMISSIONS.MEMBER_VIEW_DETAILS,
    PERMISSIONS.MEMBER_APPROVE, // Added to group
    PERMISSIONS.MEMBER_REJECT,  // Added to group
  ],
  DEPENDENT_MANAGEMENT: [
    PERMISSIONS.DEPENDENT_CREATE,
    PERMISSIONS.DEPENDENT_EDIT,
    PERMISSIONS.DEPENDENT_DELETE,
    PERMISSIONS.DEPENDENT_VIEW_ALL,
    PERMISSIONS.DEPENDENT_APPROVE,
    PERMISSIONS.DEPENDENT_REJECT,
  ],
  CLAIM_MANAGEMENT: [
    PERMISSIONS.CLAIM_CREATE,
    PERMISSIONS.CLAIM_EDIT,
    PERMISSIONS.CLAIM_DELETE,
    PERMISSIONS.CLAIM_VIEW_ALL,
    PERMISSIONS.CLAIM_APPROVE,
    PERMISSIONS.CLAIM_REJECT,
    PERMISSIONS.CLAIM_VOID,
    PERMISSIONS.CLAIM_SUBMIT,
  ],
  DOCUMENT_MANAGEMENT: [
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_DELETE,
  ],
  REPORT_ACCESS: [
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,
  ],
  ANALYTICS_ACCESS: [
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
  ],
  SYSTEM_ADMIN: [
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.ROLE_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
  ],
}

// Higher-level permission checks
export function canManageUsers(user) {
  return checkAnyPermission(user, PERMISSION_GROUPS.USER_MANAGEMENT)
}

export function canManageMembers(user) {
  return checkAnyPermission(user, PERMISSION_GROUPS.MEMBER_MANAGEMENT)
}

export function canApproveMembers(user) {
  return checkPermission(user, PERMISSIONS.MEMBER_APPROVE)
}

export function canRejectMembers(user) {
  return checkPermission(user, PERMISSIONS.MEMBER_REJECT)
}

export function canManageDependents(user) {
  return checkAnyPermission(user, PERMISSION_GROUPS.DEPENDENT_MANAGEMENT)
}

export function canManageClaims(user) {
  return checkAnyPermission(user, PERMISSION_GROUPS.CLAIM_MANAGEMENT)
}

export function canApproveClaims(user) {
  return checkPermission(user, PERMISSIONS.CLAIM_APPROVE)
}

export function canVoidClaims(user) {
  return checkPermission(user, PERMISSIONS.CLAIM_VOID)
}

export function canViewAllClaims(user) {
  return checkPermission(user, PERMISSIONS.CLAIM_VIEW_ALL)
}

export function canViewOwnClaims(user) {
  return checkPermission(user, PERMISSIONS.CLAIM_VIEW_OWN)
}

export function canManageDocuments(user) {
  return checkAnyPermission(user, PERMISSION_GROUPS.DOCUMENT_MANAGEMENT)
}

export function canViewReports(user) {
  return checkPermission(user, PERMISSIONS.REPORT_VIEW)
}

export function canExportReports(user) {
  return checkPermission(user, PERMISSIONS.REPORT_EXPORT)
}

export function canViewAuditLogs(user) {
  return checkPermission(user, PERMISSIONS.AUDIT_VIEW)
}

export function canViewAllMembers(user) {
  return checkPermission(user, PERMISSIONS.MEMBER_VIEW_ALL)
}

export function canViewMemberDetails(user) {
  return checkPermission(user, PERMISSIONS.MEMBER_VIEW_DETAILS)
}

export function canViewAllDependents(user) {
  return checkPermission(user, PERMISSIONS.DEPENDENT_VIEW_ALL)
}

export function canViewOwnDependents(user) {
  return checkPermission(user, PERMISSIONS.DEPENDENT_VIEW_OWN)
}

export function canManageSystem(user) {
  return checkAnyPermission(user, PERMISSION_GROUPS.SYSTEM_ADMIN)
}

export function canManageRoles(user) {
  return checkPermission(user, PERMISSIONS.ROLE_MANAGE)
}

export function canCreateClaims(user) {
  return checkPermission(user, PERMISSIONS.CLAIM_CREATE)
}

export function canCreateAnnouncements(user) {
  return checkPermission(user, PERMISSIONS.ANNOUNCEMENT_CREATE)
}

export function canManageAnnouncements(user) {
  return checkPermission(user, PERMISSIONS.ANNOUNCEMENT_MANAGE)
}

export function canApproveDependents(user) {
  return checkPermission(user, PERMISSIONS.DEPENDENT_APPROVE)
}

export function canRejectDependents(user) {
  return checkPermission(user, PERMISSIONS.DEPENDENT_REJECT)
}

export function canEditClaim(user, claim) {
  // Members can edit their own rejected claims or submitted claims (for corrections)
  if (user.role === "Member" && claim.memberId === user.id && (claim.status === "rejected" || claim.status === "submitted")) {
    return true
  }
  // Assistants can edit claims if they are in submitted status (before approval)
  if (user.role === "Assistant" && claim.status === "submitted") {
    return true
  }
  // Otherwise, use the standard claim.edit permission
  return checkPermission(user, PERMISSIONS.CLAIM_EDIT)
}

export function canViewAnalytics(user) {
  return checkPermission(user, PERMISSIONS.ANALYTICS_VIEW)
}

export function canExportAnalytics(user) {
  return checkPermission(user, PERMISSIONS.ANALYTICS_EXPORT)
}