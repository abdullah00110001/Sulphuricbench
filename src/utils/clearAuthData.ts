// Utility to clear all authentication data and force re-authentication
export const clearAllAuthData = () => {
  // Clear all super admin related localStorage items
  localStorage.removeItem('isSuperAdmin')
  localStorage.removeItem('superAdminEmail')
  localStorage.removeItem('superAdminLoginTime')
  localStorage.removeItem('super-admin-session')
  localStorage.removeItem('simpleAuthUser')
  
  // Clear any other auth-related data
  localStorage.removeItem('supabase.auth.token')
  
  // Force page reload to reset all state
  window.location.reload()
}