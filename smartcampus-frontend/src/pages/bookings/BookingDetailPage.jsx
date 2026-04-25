import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CalendarCheck, MapPin, Clock, User, FileText,
  Users, Loader2, CheckCircle2, XCircle, Trash2, AlertCircle, Tag
} from 'lucide-react'
import Layout from '../../components/layout/Layout'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { bookingApi } from '../../api/bookingApi'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  PENDING:   { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/30',  label: 'Pending Approval'  },
  APPROVED:  { bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/30',  label: 'Approved'          },
  REJECTED:  { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/30',    label: 'Rejected'          },
  CANCELLED: { bg: 'bg-gray-500/10',   text: 'text-gray-400',   border: 'border-gray-500/30',   label: 'Cancelled'         },
}

const STATUS_CONFIG_LIGHT = {
  PENDING:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  APPROVED:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  REJECTED:  { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'   },
  CANCELLED: { bg: 'bg-gray-100',  text: 'text-gray-600',   border: 'border-gray-200'  },
}

function DetailRow({ icon: Icon, label, value, dark }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${dark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
        <Icon size={13} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
      </div>
      <div>
        <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
        <p className={`text-sm font-medium ${dark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  )
}

export default function BookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dark } = useTheme()
  const { isAdmin, user } = useAuth()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')

  const [cancelModal, setCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    bookingApi.getById(id)
      .then(res => setBooking(res.data?.data))
      .catch(() => toast.error('Failed to load booking'))
      .finally(() => setLoading(false))
  }, [id])

  const runAction = async (label, fn) => {
    setActionLoading(label)
    try {
      await fn()
    } catch (e) {
      toast.error(e.response?.data?.message || `Failed to ${label.toLowerCase()}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleApprove = () => runAction('Approve', async () => {
    await bookingApi.approve(id)
    setBooking(prev => ({ ...prev, status: 'APPROVED' }))
    toast.success('Booking approved')
  })

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      setRejectError('Please provide a rejection reason.')
      return
    }
    await runAction('Reject', async () => {
      await bookingApi.reject(id, rejectReason.trim())
      setBooking(prev => ({ ...prev, status: 'REJECTED', rejectionReason: rejectReason.trim() }))
      toast.success('Booking rejected')
      setRejectModal(false)
      setRejectReason('')
      setRejectError('')
    })
  }

  const handleCancelSubmit = () => runAction('Cancel', async () => {
    await bookingApi.cancel(id, cancelReason.trim() || undefined)
    setBooking(prev => ({ ...prev, status: 'CANCELLED' }))
    toast.success('Booking cancelled')
    setCancelModal(false)
    setCancelReason('')
  })

  const handleDelete = () => runAction('Delete', async () => {
    if (!window.confirm('Permanently delete this booking?')) return
    await bookingApi.delete(id)
    toast.success('Booking deleted')
    navigate('/bookings')
  })

  const card = `rounded-2xl border ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-indigo-100 shadow-sm'}`
  const inputCls = `w-full text-sm rounded-xl px-3 py-2.5 border outline-none transition-all
    ${dark ? 'bg-[#0a0a14] border-[#2a2a45] text-white placeholder-gray-600 focus:border-indigo-500'
           : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400'}`
  const divider = `border-t ${dark ? 'border-[#2a2a45]' : 'border-gray-100'}`

  const isOwner = booking?.userId === user?.id
  const status = booking?.status
  const cfg = dark ? STATUS_CONFIG[status] : { ...STATUS_CONFIG[status], ...STATUS_CONFIG_LIGHT[status] }

  return (
    <Layout title="Booking Details" subtitle="View booking information and manage status">
      <div className="max-w-2xl space-y-5">

        <button
          onClick={() => navigate('/bookings')}
          className={`flex items-center gap-1.5 text-sm transition-colors ${dark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <ArrowLeft size={15} /> Back to Bookings
        </button>

        {loading ? (
          <div className={`${card} flex items-center justify-center py-20 gap-2`}>
            <Loader2 size={16} className="animate-spin text-indigo-400" />
            <span className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Loading booking…</span>
          </div>
        ) : !booking ? (
          <div className={`${card} flex flex-col items-center justify-center py-20 gap-3`}>
            <AlertCircle size={24} className="text-red-400" />
            <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Booking not found or access denied.</p>
          </div>
        ) : (
          <>
            {/* Status header */}
            <div className={`${card} p-5`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className={`font-display font-semibold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>
                    {booking.resourceName}
                  </h2>
                  {booking.resourceLocation && (
                    <p className={`flex items-center gap-1 text-sm mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <MapPin size={12} /> {booking.resourceLocation}
                    </p>
                  )}
                </div>
                {cfg && (
                  <span className={`flex-shrink-0 inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    {STATUS_CONFIG[status]?.label}
                  </span>
                )}
              </div>

              {/* Rejection / cancellation notice */}
              {status === 'REJECTED' && booking.rejectionReason && (
                <div className={`mt-4 flex items-start gap-2 text-xs p-3 rounded-xl ${dark ? 'bg-red-500/5 border border-red-500/20 text-red-300' : 'bg-red-50 border border-red-100 text-red-700'}`}>
                  <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Rejection reason:</strong> {booking.rejectionReason}</span>
                </div>
              )}
              {status === 'CANCELLED' && booking.cancellationReason && (
                <div className={`mt-4 flex items-start gap-2 text-xs p-3 rounded-xl ${dark ? 'bg-gray-500/5 border border-gray-500/20 text-gray-400' : 'bg-gray-50 border border-gray-200 text-gray-600'}`}>
                  <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Cancellation reason:</strong> {booking.cancellationReason}</span>
                </div>
              )}
            </div>

            {/* Details card */}
            <div className={`${card} p-5`}>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Booking Details</h3>
              <div className={`divide-y ${dark ? 'divide-[#2a2a45]' : 'divide-gray-100'}`}>
                <DetailRow icon={CalendarCheck} label="Date" value={booking.date} dark={dark} />
                <DetailRow icon={Clock} label="Time" value={`${booking.startTime} – ${booking.endTime}`} dark={dark} />
                <DetailRow icon={FileText} label="Purpose" value={booking.purpose} dark={dark} />
                {booking.expectedAttendees && (
                  <DetailRow icon={Users} label="Expected Attendees" value={booking.expectedAttendees} dark={dark} />
                )}
                <DetailRow icon={User} label="Requested by" value={`${booking.userName || ''} (${booking.userEmail || ''})`} dark={dark} />
                <DetailRow icon={Tag} label="Booking ID" value={booking.id} dark={dark} />
              </div>
            </div>

            {/* Actions */}
            {(isAdmin() && status === 'PENDING') && (
              <div className={`${card} p-5`}>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Admin Actions</h3>
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={!!actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-all disabled:opacity-60"
                  >
                    {actionLoading === 'Approve'
                      ? <Loader2 size={14} className="animate-spin" />
                      : <CheckCircle2 size={14} />}
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectModal(true)}
                    disabled={!!actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-all disabled:opacity-60"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            )}

            {isOwner && (status === 'PENDING' || status === 'APPROVED') && (
              <div className={`${card} p-5`}>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Booking Actions</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCancelModal(true)}
                    disabled={!!actionLoading}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-60
                      ${dark ? 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10' : 'border-amber-200 text-amber-700 hover:bg-amber-50'}`}
                  >
                    <XCircle size={14} /> Cancel Booking
                  </button>
                  {status === 'PENDING' && (
                    <button
                      onClick={handleDelete}
                      disabled={!!actionLoading}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-60
                        ${dark ? 'border-red-500/40 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-700 hover:bg-red-50'}`}
                    >
                      {actionLoading === 'Delete'
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />}
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Admin delete for PENDING */}
            {isAdmin() && status === 'PENDING' && !isOwner && (
              <div className={`${card} p-5`}>
                <button
                  onClick={handleDelete}
                  disabled={!!actionLoading}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-60
                    ${dark ? 'border-red-500/40 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-700 hover:bg-red-50'}`}
                >
                  {actionLoading === 'Delete' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete Booking
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className={`w-full max-w-md rounded-2xl p-6 border ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-gray-200 shadow-xl'}`}>
            <h3 className={`font-display font-semibold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>Reject Booking</h3>
            <p className={`text-sm mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              Provide a reason so the user knows why their request was rejected.
            </p>
            <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
              Rejection Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={e => { setRejectReason(e.target.value); setRejectError('') }}
              rows={3}
              placeholder="e.g. The room is already reserved for a university event."
              className={`${inputCls} ${rejectError ? 'border-red-500/60' : ''}`}
            />
            {rejectError && (
              <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
                <AlertCircle size={11} /> {rejectError}
              </p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setRejectModal(false); setRejectReason(''); setRejectError('') }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${dark ? 'border-[#2a2a45] text-gray-400 hover:text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading === 'Reject'}
                className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-all flex items-center justify-center gap-2"
              >
                {actionLoading === 'Reject' && <Loader2 size={14} className="animate-spin" />}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className={`w-full max-w-md rounded-2xl p-6 border ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-gray-200 shadow-xl'}`}>
            <h3 className={`font-display font-semibold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>Cancel Booking</h3>
            <p className={`text-sm mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              Are you sure you want to cancel this booking?
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
                onClick={() => { setCancelModal(false); setCancelReason('') }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${dark ? 'border-[#2a2a45] text-gray-400 hover:text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={actionLoading === 'Cancel'}
                className="flex-1 py-2 rounded-xl text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white transition-all flex items-center justify-center gap-2"
              >
                {actionLoading === 'Cancel' && <Loader2 size={14} className="animate-spin" />}
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
