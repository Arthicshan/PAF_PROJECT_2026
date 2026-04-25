import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Building2, CalendarCheck, Wrench, Bell, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const { dark } = useTheme()
  const navigate = useNavigate()

  const cards = [
    { icon: Building2, label: 'Resources', desc: 'Browse and book campus facilities', to: '/resources', color: 'from-indigo-500 to-purple-600' },
    { icon: CalendarCheck, label: 'My Bookings', desc: 'View and manage your bookings', to: '/bookings', color: 'from-blue-500 to-indigo-600' },
    { icon: Wrench, label: 'Tickets', desc: 'Report and track incidents', to: '/tickets', color: 'from-amber-500 to-orange-600' },
    { icon: Bell, label: 'Notifications', desc: 'Stay updated on your activity', to: '/notifications', color: 'from-emerald-500 to-teal-600' },
  ]

  return (
    <Layout title={`Welcome back${user?.email ? ', ' + user.email.split('@')[0] : ''}!`} subtitle="Here's what's happening on campus today">
      <div className="max-w-4xl space-y-6">

        {/* Quick access cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map(({ icon: Icon, label, desc, to, color }, i) => (
            <div
              key={to}
              onClick={() => navigate(to)}
              className={`
                group relative rounded-2xl p-5 border cursor-pointer card-hover overflow-hidden
                fade-in fade-in-delay-${i + 1}
                ${dark ? 'bg-[#16162a] border-[#2a2a45] hover:border-indigo-500/50' : 'bg-white border-indigo-100 hover:border-indigo-200 shadow-sm'}
              `}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                <Icon size={18} className="text-white" />
              </div>
              <h3 className={`font-display font-semibold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{label}</h3>
              <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-500'}`}>{desc}</p>
              <ArrowRight size={16} className={`absolute top-5 right-5 transition-transform group-hover:translate-x-1 ${dark ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
          ))}
        </div>

        {/* Coming soon modules notice */}
        <div className={`rounded-2xl p-5 border ${dark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
          <p className={`text-sm ${dark ? 'text-indigo-300' : 'text-indigo-700'}`}>
            <strong>Module A (Facilities)</strong> is fully implemented. Bookings, Tickets, and Notifications modules are coming soon.
          </p>
        </div>
      </div>
    </Layout>
  )
}
