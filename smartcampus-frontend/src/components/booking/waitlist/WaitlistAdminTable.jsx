import { useState, useEffect } from 'react'
import { Loader2, Calendar, Clock, User, MapPin } from 'lucide-react'
import { waitlistApi } from '../../../api/waitlistApi'
import WaitlistStatusBadge from './WaitlistStatusBadge'
import toast from 'react-hot-toast'

const STATUSES = ['ALL', 'WAITING', 'NOTIFIED', 'CONFIRMED', 'EXPIRED', 'REMOVED']

export default function WaitlistAdminTable({ dark }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState('ALL')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const params = activeStatus !== 'ALL' ? { status: activeStatus } : {}
      const res = await waitlistApi.getAll(params)
      setEntries(res.data?.data || [])
    } catch {
      toast.error('Failed to load waitlist entries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [activeStatus])

  const card = `rounded-2xl border ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-indigo-100 shadow-sm'}`

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className={`flex gap-1 p-1 rounded-xl overflow-x-auto ${dark ? 'bg-[#16162a] border border-[#2a2a45]' : 'bg-gray-100'}`}>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
              activeStatus === s
                ? dark ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 shadow-sm'
                : dark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={card}>
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2">
            <Loader2 size={16} className="animate-spin text-indigo-400" />
            <span className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Loading…</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No waitlist entries found.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a45]">
            {entries.map(e => (
              <div key={e.id} className={`flex items-center gap-4 px-5 py-4 ${dark ? 'hover:bg-[#1e1e35]' : 'hover:bg-gray-50'} transition-all`}>
                {/* Position bubble */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${dark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>
                  #{e.position}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{e.resourceName}</p>
                  <div className={`flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {e.resourceLocation && <span className="flex items-center gap-1"><MapPin size={10} />{e.resourceLocation}</span>}
                    <span className="flex items-center gap-1"><Calendar size={10} />{e.date}</span>
                    <span className="flex items-center gap-1"><Clock size={10} />{e.startTime} – {e.endTime}</span>
                    <span className="flex items-center gap-1"><User size={10} />{e.userName}</span>
                  </div>
                  <p className={`text-xs mt-0.5 truncate ${dark ? 'text-gray-600' : 'text-gray-400'}`}>{e.purpose}</p>
                </div>

                {/* Status */}
                <WaitlistStatusBadge status={e.status} dark={dark} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
