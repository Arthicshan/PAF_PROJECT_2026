import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck, Plus, Loader2, Eye, XCircle, Trash2,
  Clock, MapPin, User, ListChecks, Search, BadgeCheck, CircleDashed, Ban, CircleX
} from 'lucide-react'
import Layout from '../../components/layout/Layout'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { bookingApi } from '../../api/bookingApi'
import { waitlistApi } from '../../api/waitlistApi'
import WaitlistList from '../../components/booking/waitlist/WaitlistList'
import WaitlistAdminTable from '../../components/booking/waitlist/WaitlistAdminTable'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  PENDING:   { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/30',  dot: 'bg-amber-400'  },
  APPROVED:  { bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/30',  dot: 'bg-green-400'  },
  REJECTED:  { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/30',    dot: 'bg-red-400'    },
  CANCELLED: { bg: 'bg-gray-500/10',   text: 'text-gray-400',   border: 'border-gray-500/30',   dot: 'bg-gray-400'   },
}

const STATUS_COLORS_LIGHT = {
  PENDING:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200'  },
  APPROVED:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  REJECTED:  { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
  CANCELLED: { bg: 'bg-gray-100',  text: 'text-gray-600',   border: 'border-gray-200'   },
}

function StatusBadge({ status, dark }) {
  const colors = dark ? STATUS_COLORS[status] : STATUS_COLORS_LIGHT[status]
  if (!colors) return null
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${colors.bg} ${colors.text} ${colors.border}`}>
      {dark && <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[status]?.dot}`} />}
      {status}
    </span>
  )
}

const BOOKING_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']
const PAGE_TABS    = ['BOOKINGS', 'WAITLIST']

const DUMMY_BOOKINGS = [
  {
    id: 'demo-booking-1',
    resourceName: 'Innovation Lab A',
    resourceLocation: 'Engineering Building - Floor 2',
    date: '2026-05-02',
    startTime: '09:00',
    endTime: '11:00',
    status: 'PENDING',
    userName: 'Demo User',
    userId: 'demo-user',
    purpose: 'Product design sprint planning',
  },
  {
    id: 'demo-booking-2',
    resourceName: 'Seminar Hall 01',
    resourceLocation: 'Main Block - Ground Floor',
    date: '2026-05-04',
    startTime: '13:30',
    endTime: '15:00',
    status: 'APPROVED',
    userName: 'Demo User',
    userId: 'demo-user',
    purpose: 'Final year project review session',
  },
  {
    id: 'demo-booking-3',
    resourceName: 'Media Studio B',
    resourceLocation: 'Creative Center - Floor 1',
    date: '2026-05-07',
    startTime: '10:00',
    endTime: '12:00',
    status: 'REJECTED',
    userName: 'Demo User',
    userId: 'demo-user',
    purpose: 'Podcast recording for campus event',
  },
]

function StatCard({ dark, label, value, icon: Icon }) {
  return (
    <div className={`rounded-2xl border p-4 ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-gray-200 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-xs uppercase tracking-wide ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
        <Icon size={14} className={dark ? 'text-indigo-400' : 'text-indigo-600'} />
      </div>
      <p className={`text-2xl font-semibold leading-none ${dark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

export default function BookingsPage() {
  const { dark } = useTheme()
  const { isAdmin, user } = useAuth()
  const navigate = useNavigate()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingDemoFeed, setUsingDemoFeed] = useState(false)
  const [activePage, setActivePage] = useState('BOOKINGS')
  const [activeTab, setActiveTab] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  // Waitlist state (for user view in this page)
  const [waitlistEntries, setWaitlistEntries] = useState([])
  const [waitlistLoading, setWaitlistLoading] = useState(false)

  const fetchWaitlist = async () => {
    setWaitlistLoading(true)
    try {
      const res = await waitlistApi.getMyWaitlist()
      setWaitlistEntries(res.data?.data || [])
    } catch {
      toast.error('Failed to load waitlist')
    } finally {
      setWaitlistLoading(false)
    }
  }

  useEffect(() => {
    if (activePage === 'WAITLIST' && !isAdmin()) fetchWaitlist()
  }, [activePage])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      let res
      if (isAdmin()) {
        const params = activeTab !== 'ALL' ? { status: activeTab } : {}
        res = await bookingApi.getAll(params)
      } else {
        res = await bookingApi.getMyBookings()
      }
      const data = res.data?.data || []
      const list = Array.isArray(data) ? data : []
      setBookings(list)
      setUsingDemoFeed(false)
    } catch {
      const demoList = isAdmin() ? DUMMY_BOOKINGS : DUMMY_BOOKINGS.filter((b) => b.userId === 'demo-user')
      setBookings(demoList)
      setUsingDemoFeed(true)
      toast.error('Backend bookings unavailable. Showing demo feed.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [activeTab, isAdmin])

  const handleWaitlistRemove = async (id) => {
    if (!window.confirm('Remove yourself from this waitlist?')) return
    try {
      await waitlistApi.remove(id)
      setWaitlistEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'REMOVED' } : e))
      toast.success('Removed from waitlist')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove')
    }
  }

  const handleWaitlistConfirm = async (id) => {
    try {
      await waitlistApi.confirm(id)
      setWaitlistEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'CONFIRMED' } : e))
      toast.success('Confirmed! Booking is now pending approval.')
      navigate('/bookings')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm')
      fetchWaitlist()
    }
  }

  const statusSummary = useMemo(() => {
    return bookings.reduce((acc, b) => {
      acc.total += 1
      acc[b.status] = (acc[b.status] || 0) + 1
      return acc
    }, { total: 0, PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 })
  }, [bookings])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const byStatus = activeTab === 'ALL' ? bookings : bookings.filter(b => b.status === activeTab)

    if (!term) return byStatus

    return byStatus.filter((b) => (
      b.resourceName?.toLowerCase().includes(term)
      || b.resourceLocation?.toLowerCase().includes(term)
      || b.userName?.toLowerCase().includes(term)
      || b.purpose?.toLowerCase().includes(term)
      || b.date?.toLowerCase().includes(term)
    ))
  }, [bookings, activeTab, searchTerm])

  const handleDelete = async (id) => {
    if (usingDemoFeed) {
      toast('Demo feed: connect backend to perform delete actions.')
      return
    }
    if (!window.confirm('Delete this booking? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await bookingApi.delete(id)
      setBookings(prev => prev.filter(b => b.id !== id))
      toast.success('Booking deleted')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete booking')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return
    if (usingDemoFeed) {
      toast('Demo feed: connect backend to perform cancel actions.')
      return
    }
    setCancelling(true)
    try {
      await bookingApi.cancel(cancelTarget.id, cancelReason.trim() || undefined)
      setBookings(prev => prev.map(b => b.id === cancelTarget.id ? { ...b, status: 'CANCELLED' } : b))
      toast.success('Booking cancelled')
      setCancelTarget(null)
      setCancelReason('')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancelling(false)
    }
  }

  const card = `rounded-2xl border ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-indigo-100 shadow-sm'}`
  const inputCls = `w-full text-sm rounded-xl px-3 py-2 border outline-none transition-all
    ${dark
      ? 'bg-[#0a0a14] border-[#2a2a45] text-white placeholder-gray-600 focus:border-indigo-500'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400'}`

  const filterTabs = isAdmin() ? BOOKING_TABS : ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

  return (
    <Layout title="Bookings" subtitle="Manage your room and equipment bookings">
      <div className="max-w-6xl space-y-5">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CalendarCheck size={18} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
            <h2 className={`font-display font-semibold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>
              {isAdmin() ? 'All Bookings' : 'My Bookings'}
            </h2>
            {usingDemoFeed && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${dark ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                Demo Feed
              </span>
            )}
          </div>
          <button
            onClick={() => navigate('/bookings/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all"
          >
            <Plus size={15} />
            New Booking
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard dark={dark} label="Total" value={statusSummary.total} icon={CalendarCheck} />
          <StatCard dark={dark} label="Pending" value={statusSummary.PENDING} icon={CircleDashed} />
          <StatCard dark={dark} label="Approved" value={statusSummary.APPROVED} icon={BadgeCheck} />
          <StatCard dark={dark} label="Rejected" value={statusSummary.REJECTED} icon={CircleX} />
          <StatCard dark={dark} label="Cancelled" value={statusSummary.CANCELLED} icon={Ban} />
        </div>

        {/* Page-level tabs: Bookings | Waitlist */}
        <div className={`flex gap-1 p-1 rounded-xl ${dark ? 'bg-[#16162a] border border-[#2a2a45]' : 'bg-gray-100'}`}>
          {PAGE_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActivePage(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg transition-all ${
                activePage === tab
                  ? dark ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 shadow-sm'
                  : dark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'WAITLIST' && <ListChecks size={12} />}
              {tab === 'BOOKINGS' ? (isAdmin() ? 'All Bookings' : 'My Bookings') : 'My Waitlist'}
            </button>
          ))}
        </div>

        {/* Booking status sub-tabs — only shown on BOOKINGS tab */}
        {activePage === 'BOOKINGS' && (
        <>
        <div className={`flex gap-1 p-1 rounded-xl overflow-x-auto ${dark ? 'bg-[#16162a] border border-[#2a2a45]' : 'bg-gray-100'}`}>
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                activeTab === tab
                  ? dark ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 shadow-sm'
                  : dark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={`relative rounded-2xl border px-3 py-2 ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-gray-200 shadow-sm'}`}>
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by resource, location, date, purpose, or requester"
            className={`w-full pl-8 pr-2 py-1.5 bg-transparent text-sm outline-none ${dark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`}
          />
        </div>
        </>
        )}

        {/* ── WAITLIST TAB ─────────────────────────────────────────────── */}
        {activePage === 'WAITLIST' && (
          <div>
            {isAdmin() ? (
              <WaitlistAdminTable dark={dark} />
            ) : waitlistLoading ? (
              <div className="flex items-center justify-center py-16 gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-400" />
                <span className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Loading waitlist…</span>
              </div>
            ) : (
              <WaitlistList
                entries={waitlistEntries}
                dark={dark}
                onRemove={handleWaitlistRemove}
                onConfirm={handleWaitlistConfirm}
                emptyMessage="You are not on any waitlists yet. Join one when a booking conflicts!"
              />
            )}
          </div>
        )}

        {/* ── BOOKINGS TAB ─────────────────────────────────────────────── */}
        {activePage === 'BOOKINGS' && <div className={card}>
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 size={16} className="animate-spin text-indigo-400" />
              <span className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Loading bookings…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${dark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                <CalendarCheck size={24} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
              </div>
              <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                {searchTerm.trim()
                  ? 'No bookings match your search.'
                  : activeTab === 'ALL'
                    ? 'No bookings found'
                    : `No ${activeTab.toLowerCase()} bookings`}
              </p>
              <button
                onClick={() => navigate('/bookings/new')}
                className="text-xs px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all"
              >
                Create your first booking
              </button>
            </div>
          ) : (
            <div className={`divide-y ${dark ? 'divide-[#2a2a45]' : 'divide-gray-100'}`}>
              {filtered.map(b => (
                <div
                  key={b.id}
                  className={`flex items-start sm:items-center gap-4 px-5 py-4 transition-all ${dark ? 'hover:bg-[#1e1e35]' : 'hover:bg-gray-50'}`}
                >
                  {/* Date block */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-center ${dark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                    <span className={`text-[10px] font-medium uppercase ${dark ? 'text-indigo-300' : 'text-indigo-500'}`}>
                      {b.date ? new Date(b.date).toLocaleString('default', { month: 'short' }) : '—'}
                    </span>
                    <span className={`text-lg font-display font-bold leading-none ${dark ? 'text-white' : 'text-indigo-700'}`}>
                      {b.date ? new Date(b.date).getDate() : '—'}
                    </span>
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                      {b.resourceName || 'Resource'}
                    </p>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                      {b.resourceLocation && (
                        <span className={`flex items-center gap-1 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <MapPin size={10} /> {b.resourceLocation}
                        </span>
                      )}
                      <span className={`flex items-center gap-1 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <Clock size={10} /> {b.startTime} – {b.endTime}
                      </span>
                      {isAdmin() && b.userName && (
                        <span className={`flex items-center gap-1 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <User size={10} /> {b.userName}
                        </span>
                      )}
                    </div>
                    {b.purpose && (
                      <p className={`text-xs mt-1 truncate ${dark ? 'text-gray-600' : 'text-gray-400'}`}>{b.purpose}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={b.status} dark={dark} />

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/bookings/${b.id}`)}
                        disabled={usingDemoFeed}
                        title="View details"
                        className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'} disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        <Eye size={14} />
                      </button>
                      {(b.status === 'PENDING' || b.status === 'APPROVED') && b.userId === user?.id && (
                        <button
                          onClick={() => setCancelTarget(b)}
                          title="Cancel booking"
                          className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/10' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`}
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                      {b.status === 'PENDING' && (b.userId === user?.id || isAdmin()) && (
                        <button
                          onClick={() => handleDelete(b.id)}
                          disabled={deletingId === b.id}
                          title="Delete booking"
                          className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                        >
                          {deletingId === b.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>}
      </div>

      {/* Cancel modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className={`w-full max-w-md rounded-2xl p-6 border ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-gray-200 shadow-xl'}`}>
            <h3 className={`font-display font-semibold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>Cancel Booking</h3>
            <p className={`text-sm mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              Cancel booking for <span className="font-medium">{cancelTarget.resourceName}</span> on <span className="font-medium">{cancelTarget.date}</span>?
            </p>
            <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
              Reason (optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Why are you cancelling?"
              className={inputCls}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setCancelTarget(null); setCancelReason('') }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${dark ? 'border-[#2a2a45] text-gray-400 hover:text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelling}
                className="flex-1 py-2 rounded-xl text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white transition-all flex items-center justify-center gap-2"
              >
                {cancelling && <Loader2 size={14} className="animate-spin" />}
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
