export const isAdmin = (user) => user?.role === 'ADMIN'
export const isManager = (user) => ['ADMIN', 'MANAGER'].includes(user?.role)
export const isTechnician = (user) => ['ADMIN', 'TECHNICIAN'].includes(user?.role)
export const isUser = (user) => user?.role === 'USER'

export const getRoleBadgeColor = (role) => {
  const map = {
    ADMIN: 'bg-red-500/20 text-red-400 border border-red-500/30',
    MANAGER: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    TECHNICIAN: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    USER: 'bg-green-500/20 text-green-400 border border-green-500/30',
  }
  return map[role] || 'bg-gray-500/20 text-gray-400'
}
