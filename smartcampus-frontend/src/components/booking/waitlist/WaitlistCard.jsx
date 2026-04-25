import { useState, useEffect } from 'react'
import { Clock, MapPin, Users, Calendar, Loader2, CheckCircle, XCircle } from 'lucide-react'
import WaitlistStatusBadge from './WaitlistStatusBadge'

function CountdownTimer({ expiresAt }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt) - new Date()
      if (diff <= 0) { setRemaining('Expired'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setRemaining(`${h}h ${m}m left to confirm`)
    }
    calc()
    const id = setInterval(calc, 60000)
    return () => clearInterval(id)
  }, [expiresAt])

  return (
    <span className="flex items-center gap-1 text-xs font-medium text-orange-400">
      <Clock size={11} /> {remaining}
    </span>
  )
}

export default function WaitlistCard({ entry, dark, onRemove, onConfirm }) {
  const [removing, setRemoving] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const isNotified = entry.status === 'NOTIFIED'
  const isWaiting  = entry.status === 'WAITING'

  const handleRemove = async () => {
    setRemoving(true)
    try { await onRemove(entry.id) } finally { setRemoving(false) }
  }

  const handleConfirm = async () => {
    setConfirming(true)
    try { await onConfirm(entry.id) } finally { setConfirming(false) }
  }

  const cardBase = `rounded-2xl border p-4 transition-all ${
    isNotified
      ? dark
        ? 'bg-orange-500/5 border-orange-500/40 ring-1 ring-orange-500/30'
        : 'bg-orange-50 border-orange-300 ring-1 ring-orange-200'
      : dark
        ? 'bg-[#16162a] border-[#2a2a45]'
        : 'bg-white border-indigo-100 shadow-sm'
  }`

  return (
    <div className={cardBase}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
            {entry.resourceName}
          </p>
          {entry.resourceLocation && (
            <span className={`flex items-center gap-1 text-xs mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              <MapPin size={10} /> {entry.resourceLocation}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <WaitlistStatusBadge status={entry.status} dark={dark} />
          <span className={`text-xs font-medium ${dark ? 'text-indigo-300' : 'text-indigo-600'}`}>
            #{entry.position} in queue
          </span>
        </div>
      </div>

      {/* Slot info */}
      <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs mb-3 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
        <span className="flex items-center gap-1">
          <Calendar size={11} /> {entry.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} /> {entry.startTime} – {entry.endTime}
        </span>
        {entry.expectedAttendees && (
          <span className="flex items-center gap-1">
            <Users size={11} /> {entry.expectedAttendees} attendees
          </span>
        )}
      </div>

      {/* Purpose */}
      <p className={`text-xs truncate mb-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
        {entry.purpose}
      </p>

      {/* Countdown for NOTIFIED */}
      {isNotified && entry.expiresAt && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-3 ${dark ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
          ⏰ <CountdownTimer expiresAt={entry.expiresAt} />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {isNotified && (
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium bg-green-600 hover:bg-green-500 text-white transition-all disabled:opacity-60"
          >
            {confirming ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
            {confirming ? 'Confirming…' : 'Confirm My Booking'}
          </button>
        )}
        {(isWaiting || isNotified) && (
          <button
            onClick={handleRemove}
            disabled={removing}
            className={`${isNotified ? '' : 'flex-1'} flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-medium border transition-all disabled:opacity-60
              ${dark ? 'border-[#2a2a45] text-gray-400 hover:text-red-400 hover:border-red-500/40' : 'border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200'}`}
          >
            {removing ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
            {removing ? 'Leaving…' : 'Leave Waitlist'}
          </button>
        )}
      </div>
    </div>
  )
}
