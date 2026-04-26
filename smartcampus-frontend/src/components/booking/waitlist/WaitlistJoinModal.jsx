import { useState } from 'react'
import { Clock, Loader2, ListPlus, X, AlertCircle } from 'lucide-react'
import { waitlistApi } from '../../../api/waitlistApi'
import toast from 'react-hot-toast'

export default function WaitlistJoinModal({ dark, prefill, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false)
  const [note, setNote] = useState(prefill?.purpose || '')

  const handleJoin = async () => {
    if (!prefill?.resourceId || !prefill?.date || !prefill?.startTime || !prefill?.endTime) {
      toast.error('Missing booking details. Please try again.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        resourceId: prefill.resourceId,
        date: prefill.date,
        startTime: prefill.startTime,
        endTime: prefill.endTime,
        purpose: note.trim() || prefill.purpose,
        ...(prefill.expectedAttendees && { expectedAttendees: Number(prefill.expectedAttendees) }),
      }
      const res = await waitlistApi.join(payload)
      const entry = res.data?.data
      toast.success(`You joined the waitlist! Your position: #${entry?.position}`)
      onSuccess && onSuccess(entry)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to join waitlist'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = `w-full text-sm rounded-xl px-3 py-2.5 border outline-none transition-all
    ${dark
      ? 'bg-[#0a0a14] border-[#2a2a45] text-white placeholder-gray-600 focus:border-indigo-500'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400'}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className={`w-full max-w-md rounded-2xl p-6 border ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-gray-200 shadow-xl'}`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
              <ListPlus size={18} className={dark ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <div>
              <h3 className={`font-display font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Join Waitlist</h3>
              <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>We'll notify you instantly if a slot opens up</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
            <X size={16} />
          </button>
        </div>

        {/* Slot summary */}
        <div className={`rounded-xl p-3 mb-4 text-xs ${dark ? 'bg-[#0a0a14] border border-[#2a2a45]' : 'bg-gray-50 border border-gray-100'}`}>
          <p className={`font-medium mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{prefill?.resourceName || 'Resource'}</p>
          <div className={`flex flex-wrap gap-x-3 gap-y-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            <span>📅 {prefill?.date}</span>
            <span><Clock size={11} className="inline mr-0.5" />{prefill?.startTime} – {prefill?.endTime}</span>
          </div>
        </div>

        {/* Purpose field (editable) */}
        <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
          Purpose <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={2}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Why do you need this resource?"
          className={inputCls + ' mb-4'}
        />

        {/* Info note */}
        <div className={`flex items-start gap-2 text-xs p-3 rounded-xl mb-4 ${dark ? 'bg-blue-500/5 border border-blue-500/20 text-blue-300' : 'bg-blue-50 border border-blue-100 text-blue-700'}`}>
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
          If the current booking gets cancelled, you will be notified immediately and have 24 hours to confirm.
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${dark ? 'border-[#2a2a45] text-gray-400 hover:text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Choose Different Time
          </button>
          <button
            onClick={handleJoin}
            disabled={submitting || !note.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? 'Joining…' : 'Join Waitlist'}
          </button>
        </div>
      </div>
    </div>
  )
}
