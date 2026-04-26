import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, token } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0f1a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-indigo-300 text-sm font-body">Loading Smart Campus...</p>
        </div>
      </div>
    )
  }

  if (!token || !user) return <Navigate to="/login" replace />

  if (requiredRole) {
    const roleHierarchy = { USER: 1, TECHNICIAN: 2, MANAGER: 3, ADMIN: 4 }
    if ((roleHierarchy[user.role] || 0) < (roleHierarchy[requiredRole] || 0)) {
      return <Navigate to="/resources" replace />
    }
  }

  return children
}
