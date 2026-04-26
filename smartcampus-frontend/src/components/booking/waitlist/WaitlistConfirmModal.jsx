import { useState } from 'react'
import { CheckCircle, Loader2, X, AlertCircle } from 'lucide-react'
import { waitlistApi } from '../../../api/waitlistApi'
import toast from 'react-hot-toast'

export default function WaitlistConfirmModal({ dark, entry, onClose, onSuccess }) {
  const [confirming, setConfirming] = useState(false)

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      const res = await waitlistApi.confirm(entry.id)
      const booking = res.data?.data
      toast.success('Booking confirmed! It is now PENDING admin approval.')
      onSuccess && onSuccess(booking)
      onClose()
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.message || 'Failed to confirm'
      if (status === 410) {
        toast.error('Your slot has expired. The next person in queue has been notified.')
      } else {
        toast.error(msg)
      }
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className={`w-full max-w-md rounded-2xl p-6 border ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-gray-200 shadow-xl'}`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-500/10">
              <CheckCircle size={18} className="text-green-400" />
            </div>
            <div>
              <h3 className={`font-display font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Confirm Booking</h3>
              <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Slot is available for you now</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
            <X size={16} />
          </button>
        </div>

        {/* Slot details */}
        <div className={`rounded-xl p-4 mb-4 ${dark ? 'bg-[#0a0a14] border border-[#2a2a45]' : 'bg-gray-50 border border-gray-100'}`}>
          <p className={`font-semibold text-sm mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>{entry?.resourceName}</p>
          <div className={`space-y-1 text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>📅 {entry?.date}</p>
            <p>🕐 {entry?.startTime} – {entry?.endTime}</p>
            <p>📝 {entry?.purpose}</p>
          </div>
        </div>

        {/* Warning */}
        <div className={`flex items-start gap-2 text-xs p-3 rounded-xl mb-4 ${dark ? 'bg-orange-500/5 border border-orange-500/20 text-orange-300' : 'bg-orange-50 border border-orange-100 text-orange-700'}`}>
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
          Confirming will create a PENDING booking. An admin must still approve it.
          {entry?.expiresAt && (
            <span className="block mt-1 font-medium">
              Expires: {new Date(entry.expiresAt).toLocaleString()}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${dark ? 'border-[#2a2a45] text-gray-400 hover:text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {confirming && <Loader2 size={14} className="animate-spin" />}
            {confirming ? 'Confirming…' : 'Yes, Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}
