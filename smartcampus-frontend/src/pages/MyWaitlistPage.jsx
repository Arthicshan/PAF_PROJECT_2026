import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListChecks, Loader2, AlertTriangle } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useTheme } from '../context/ThemeContext'
import { waitlistApi } from '../api/waitlistApi'
import WaitlistList from '../components/booking/waitlist/WaitlistList'
import toast from 'react-hot-toast'

export default function MyWaitlistPage() {
  const { dark } = useTheme()
  const navigate = useNavigate()

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchWaitlist = async () => {
    setLoading(true)
    try {
      const res = await waitlistApi.getMyWaitlist()
      setEntries(res.data?.data || [])
    } catch {
      toast.error('Failed to load your waitlist')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWaitlist() }, [])

  const handleRemove = async (id) => {
    if (!window.confirm('Remove yourself from this waitlist?')) return
    try {
      await waitlistApi.remove(id)
      setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'REMOVED' } : e))
      toast.success('Removed from waitlist')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove from waitlist')
    }
  }

  const handleConfirm = async (id) => {
    try {
      await waitlistApi.confirm(id)
      setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'CONFIRMED' } : e))
      toast.success('Booking confirmed! Now pending admin approval.')
      navigate('/bookings')
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.message || 'Failed to confirm'
      if (status === 410) {
        toast.error('Your slot expired. The next person in queue was notified.')
        fetchWaitlist()
      } else {
        toast.error(msg)
      }
    }
  }

  // Split by category
  const notified = entries.filter(e => e.status === 'NOTIFIED')
  const waiting  = entries.filter(e => e.status === 'WAITING')
  const history  = entries.filter(e => ['CONFIRMED', 'EXPIRED', 'REMOVED'].includes(e.status))

  const activeCount = notified.length + waiting.length

  const sectionTitle = (text, count) => (
    <div className="flex items-center gap-2 mb-3">
      <h3 className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{text}</h3>
      {count > 0 && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
          {count}
        </span>
      )}
    </div>
  )

  return (
    <Layout title="My Waitlist" subtitle="Track and manage your waitlist positions">
      <div className="max-w-3xl space-y-6">

        {/* Summary bar */}
        {!loading && (
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-indigo-100 shadow-sm'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
              <ListChecks size={20} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
                {activeCount > 0
                  ? `You are waiting for ${activeCount} resource${activeCount > 1 ? 's' : ''}`
                  : 'No active waitlist entries'}
              </p>
              <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                {notified.length > 0
                  ? `${notified.length} slot${notified.length > 1 ? 's' : ''} available — action required!`
                  : 'You\'ll be notified instantly when a slot opens up'}
              </p>
            </div>
            {notified.length > 0 && (
              <div className="ml-auto">
                <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 animate-pulse">
                  <AlertTriangle size={12} /> {notified.length} slot{notified.length > 1 ? 's' : ''} awaiting confirmation
                </span>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2">
            <Loader2 size={18} className="animate-spin text-indigo-400" />
            <span className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Loading your waitlist…</span>
          </div>
        ) : (
          <>
            {/* NOTIFIED section — urgent, shown at top */}
            {notified.length > 0 && (
              <section>
                {sectionTitle('⏰ Action Required — Slots Available', notified.length)}
                <WaitlistList
                  entries={notified}
                  dark={dark}
                  onRemove={handleRemove}
                  onConfirm={handleConfirm}
                  emptyMessage="No slots awaiting confirmation."
                />
              </section>
            )}

            {/* WAITING section */}
            <section>
              {sectionTitle('⏳ Waiting in Queue', waiting.length)}
              <WaitlistList
                entries={waiting}
                dark={dark}
                onRemove={handleRemove}
                onConfirm={handleConfirm}
                emptyMessage="You are not waiting for any resources."
              />
            </section>

            {/* History — collapsed by default */}
            {history.length > 0 && (
              <section>
                {sectionTitle('📋 History', history.length)}
                <WaitlistList
                  entries={history}
                  dark={dark}
                  onRemove={handleRemove}
                  onConfirm={handleConfirm}
                  emptyMessage="No history yet."
                />
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
