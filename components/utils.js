// Shared utilities for claims/members
import { getClaims, getMembers, getDependents } from '@/lib/storage'

export function getMemberName(memberId) {
  const member = getMembers().find(m => m.id === memberId)
  return member ? member.name : 'Unknown'
}

export function getDependentName(dependentId) {
  const dependent = getDependents().find(d => d.id === dependentId)
  return dependent ? dependent.name : 'Unknown Dependent'
}

export function getClaimsByStatus(statuses) {
  return getClaims().filter(c => statuses.includes(c.status))
}

export function refreshClaims() {
  // Force storage refresh by accessing
  getClaims()
  getMembers()
}
