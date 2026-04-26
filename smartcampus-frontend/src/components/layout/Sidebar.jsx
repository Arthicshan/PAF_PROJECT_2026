import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  LayoutDashboard, Building2, CalendarCheck, Wrench,
  Bell, Users, BarChart3, Sun, Moon, LogOut, ChevronRight, Zap, ListChecks
} from 'lucide-react'
import { getRoleBadgeColor } from '../../utils/roleUtils'
import { waitlistApi } from '../../api/waitlistApi'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',     to: '/dashboard',     roles: ['USER','TECHNICIAN','MANAGER','ADMIN'] },
  { icon: Building2,       label: 'Resources',     to: '/resources',     roles: ['USER','TECHNICIAN','MANAGER','ADMIN'] },
  { icon: CalendarCheck,   label: 'Bookings',      to: '/bookings',      roles: ['USER','TECHNICIAN','MANAGER','ADMIN'] },
  { icon: ListChecks,      label: 'Waitlist',      to: '/waitlist',      roles: ['USER','TECHNICIAN','MANAGER','ADMIN'], badge: true },
  { icon: Wrench,          label: 'Tickets',       to: '/tickets',       roles: ['USER','TECHNICIAN','MANAGER','ADMIN'] },
  { icon: Bell,            label: 'Notifications', to: '/notifications', roles: ['USER','TECHNICIAN','MANAGER','ADMIN'] },
]

const adminItems = [
  { icon: Users, label: 'Users', to: '/admin/users', roles: ['ADMIN'] },
  { icon: BarChart3, label: 'Analytics', to: '/admin/analytics', roles: ['ADMIN','MANAGER'] },
]

export default function Sidebar() {
  const { user, logout, isAdmin, isManager } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [waitlistCount, setWaitlistCount] = useState(0)

  useEffect(() => {
    if (!user) return
    waitlistApi.getActiveCount()
      .then(res => setWaitlistCount(res.data?.activeCount || 0))
      .catch(() => {})
    // refresh badge every 60 seconds
    const id = setInterval(() => {
      waitlistApi.getActiveCount()
        .then(res => setWaitlistCount(res.data?.activeCount || 0))
        .catch(() => {})
    }, 60000)
    return () => clearInterval(id)
  }, [user])

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'SC'

  return (
    <aside className={`
      fixed left-0 top-0 h-full w-64 flex flex-col z-40
      ${dark
        ? 'bg-[#0f0f1a] border-r border-[#2a2a45]'
        : 'bg-white border-r border-indigo-100'
      }
    `}>
      {/* Logo */}
      <div className={`px-6 py-5 border-b ${dark ? 'border-[#2a2a45]' : 'border-indigo-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h1 className={`font-display font-700 text-sm leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
              Smart Campus
            </h1>
            <p className={`text-xs ${dark ? 'text-indigo-400' : 'text-indigo-500'}`}>Operations Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className={`text-[10px] font-semibold uppercase tracking-widest px-3 mb-2 ${dark ? 'text-indigo-500' : 'text-indigo-400'}`}>
          Main
        </p>
        <ul className="space-y-1">
          {navItems.map(({ icon: Icon, label, to, badge }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group
                  ${isActive
                    ? `sidebar-active font-medium ${dark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`
                    : `${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
                  }
                `}
              >
                <Icon size={16} className="flex-shrink-0" />
                <span className="font-body">{label}</span>
                {badge && waitlistCount > 0 ? (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-white min-w-[18px] text-center">
                    {waitlistCount}
                  </span>
                ) : (
                  <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {(isAdmin() || isManager()) && (
          <>
            <p className={`text-[10px] font-semibold uppercase tracking-widest px-3 mb-2 mt-6 ${dark ? 'text-indigo-500' : 'text-indigo-400'}`}>
              Admin
            </p>
            <ul className="space-y-1">
              {adminItems.filter(item =>
                item.roles.includes(user?.role)
              ).map(({ icon: Icon, label, to }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group
                      ${isActive
                        ? `sidebar-active font-medium ${dark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`
                        : `${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
                      }
                    `}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="font-body">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* Bottom — user + theme */}
      <div className={`px-3 py-4 border-t ${dark ? 'border-[#2a2a45]' : 'border-indigo-100'}`}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-2 transition-all
            ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'}
          `}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
          <span className="font-body">{dark ? 'Light mode' : 'Dark mode'}</span>
        </button>

        {/* User profile */}
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${dark ? 'bg-white/5' : 'bg-indigo-50'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
              {user?.email?.split('@')[0] || 'User'}
            </p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getRoleBadgeColor(user?.role)}`}>
              {user?.role || 'USER'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className={`p-1 rounded transition-colors ${dark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
