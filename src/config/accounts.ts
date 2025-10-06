// Super Admin Account Configuration
// Change these credentials as needed for different environments

export const SUPER_ADMIN_ACCOUNTS = [
  {
    email: 'abdullahusimin1@gmail.com',
    name: 'Abdullah Usimin',
    role: 'super_admin',
    password: import.meta.env.VITE_SUPER_ADMIN_1_PASSWORD || '@abdullah1'
  },
  {
    email: 'stv7168@gmail.com', 
    name: 'STV Admin',
    role: 'super_admin',
    password: import.meta.env.VITE_SUPER_ADMIN_2_PASSWORD || '12345678'
  },
  {
    email: 'abdullahabeer003@gmail.com',
    name: 'Abdullah Abeer', 
    role: 'super_admin',
    password: import.meta.env.VITE_SUPER_ADMIN_3_PASSWORD || '12345678'
  }
]

// Default password for all super admin accounts
export const SUPER_ADMIN_PASSWORD = '12345678'

// Update password here and it will be reflected across the application
export const getSuperAdminPassword = () => SUPER_ADMIN_PASSWORD

// Check if email is a super admin
export const isSuperAdminEmail = (email: string) => {
  return SUPER_ADMIN_ACCOUNTS.some(account => account.email === email)
}

// Get super admin by email
export const getSuperAdminByEmail = (email: string) => {
  return SUPER_ADMIN_ACCOUNTS.find(account => account.email === email)
}