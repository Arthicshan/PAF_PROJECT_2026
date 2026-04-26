import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarPlus, ArrowLeft, Loader2, AlertCircle, ListPlus, Info, Clock3, CalendarDays } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import { useTheme } from '../../context/ThemeContext'
import { bookingApi } from '../../api/bookingApi'
import { resourceApi } from '../../api/resourceApi'
import WaitlistJoinModal from '../../components/booking/waitlist/WaitlistJoinModal'
import toast from 'react-hot-toast'

const today = () => new Date().toISOString().split('T')[0]

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
      <AlertCircle size={11} /> {msg}
    </p>
  )
}

const DUMMY_RESOURCES = [
  { id: 'demo-resource-1', name: 'Innovation Lab A', location: 'Engineering Building - Floor 2', status: 'ACTIVE' },
  { id: 'demo-resource-2', name: 'Seminar Hall 01', location: 'Main Block - Ground Floor', status: 'ACTIVE' },
  { id: 'demo-resource-3', name: 'Media Studio B', location: 'Creative Center - Floor 1', status: 'ACTIVE' },
]

export default function BookingFormPage() {
  const { dark } = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [resources, setResources] = useState([])
  const [usingDemoResources, setUsingDemoResources] = useState(false)
  const [loadingResources, setLoadingResources] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showConflictBanner, setShowConflictBanner] = useState(false)
  const [showWaitlistModal, setShowWaitlistModal] = useState(false)

  const [form, setForm] = useState({
    resourceId: searchParams.get('resourceId') || '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    const loadResources = async () => {
      setLoadingResources(true)
      try {
        const activeRes = await resourceApi.getByStatus('ACTIVE')
        const activeList = Array.isArray(activeRes.data?.data) ? activeRes.data.data : []

        if (activeList.length > 0) {
          setResources(activeList)
          setUsingDemoResources(false)
          return
        }

        const allRes = await resourceApi.getAll()
        const allList = Array.isArray(allRes.data?.data) ? allRes.data.data : []
        const normalized = allList.filter((r) => String(r.status || '').toUpperCase() === 'ACTIVE')

        if (normalized.length > 0) {
          setResources(normalized)
          setUsingDemoResources(false)
          return
        }

        setResources(DUMMY_RESOURCES)
        setUsingDemoResources(true)
        toast('No ACTIVE resources found from backend. Showing demo resources.')
      } catch {
        setResources(DUMMY_RESOURCES)
        setUsingDemoResources(true)
        toast.error('Backend resources unavailable. Showing demo resources.')
      } finally {
        setLoadingResources(false)
      }
    }

    loadResources()
  }, [])

  const validate = () => {
    const e = {}

    if (!form.resourceId) e.resourceId = 'Please select a resource.'

    if (!form.date) {
      e.date = 'Date is required.'
    } else if (form.date < today()) {
      e.date = 'Date must be today or in the future.'
    }

    if (!form.startTime) {
      e.startTime = 'Start time is required.'
    }

    if (!form.endTime) {
      e.endTime = 'End time is required.'
    } else if (form.startTime && form.endTime <= form.startTime) {
      e.endTime = 'End time must be after start time.'
    }

    if (!form.purpose.trim()) {
      e.purpose = 'Purpose is required.'
    } else if (form.purpose.trim().length < 5) {
      e.purpose = 'Purpose must be at least 5 characters.'
    } else if (form.purpose.trim().length > 255) {
      e.purpose = 'Purpose must not exceed 255 characters.'
    }

    if (form.expectedAttendees !== '') {
      const n = Number(form.expectedAttendees)
      if (!Number.isInteger(n) || n < 1) {
        e.expectedAttendees = 'Must be a positive whole number.'
      }
    }

    return e
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (usingDemoResources && String(form.resourceId).startsWith('demo-resource-')) {
      toast.error('You selected a demo resource. Connect backend resources to create real bookings.')
      return
    }

    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        resourceId: form.resourceId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose.trim(),
        ...(form.expectedAttendees !== '' && { expectedAttendees: Number(form.expectedAttendees) }),
      }
      await bookingApi.create(payload)
      toast.success('Booking request submitted! Awaiting approval.')
      navigate('/bookings')
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.message || 'Failed to submit booking'
      if (status === 409 || msg.toLowerCase().includes('conflict') || msg.toLowerCase().includes('overlap')) {
        setShowConflictBanner(true)
      } else {
        toast.error(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const selectedResource = resources.find(r => r.id === form.resourceId)

  const card = `rounded-2xl border p-6 ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-indigo-100 shadow-sm'}`
  const label = `block text-xs font-medium mb-1.5 ${dark ? 'text-gray-400' : 'text-gray-600'}`
  const input = (hasError) => `w-full text-sm rounded-xl px-3 py-2.5 border outline-none transition-all
    ${hasError
      ? 'border-red-500/60 bg-red-500/5 text-red-300 placeholder-red-400/50'
      : dark
        ? 'bg-[#0a0a14] border-[#2a2a45] text-white placeholder-gray-600 focus:border-indigo-500'
        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400'
    }`

  return (
    <Layout title="New Booking" subtitle="Request a room or equipment reservation">
      <div className="max-w-5xl space-y-5">

        {/* Back button */}
        <button
          onClick={() => navigate('/bookings')}
          className={`flex items-center gap-1.5 text-sm transition-colors ${dark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <ArrowLeft size={15} /> Back to Bookings
        </button>

        <div className="grid lg:grid-cols-[1.35fr_0.85fr] gap-5">
          <div className={card}>
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                <CalendarPlus size={18} className={dark ? 'text-indigo-400' : 'text-indigo-600'} />
              </div>
              <div>
                <h2 className={`font-display font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Book a Resource</h2>
                <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Fill in the details below to submit your request</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Resource */}
              <div>
                <label className={label}>Resource <span className="text-red-400">*</span></label>
                <select
                  value={form.resourceId}
                  onChange={e => handleChange('resourceId', e.target.value)}
                  disabled={loadingResources}
                  className={input(errors.resourceId)}
                >
                  <option value="">
                    {loadingResources ? 'Loading resources…' : '— Select a resource —'}
                  </option>
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>{r.name} {r.location ? `— ${r.location}` : ''}</option>
                  ))}
                </select>
                <FieldError msg={errors.resourceId} />
                {usingDemoResources && (
                  <p className={`text-xs mt-1 ${dark ? 'text-amber-300' : 'text-amber-700'}`}>
                    Demo resources are shown because backend active resources are unavailable.
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className={label}>Booking Date <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  min={today()}
                  value={form.date}
                  onChange={e => handleChange('date', e.target.value)}
                  className={input(errors.date)}
                />
                <FieldError msg={errors.date} />
              </div>

              {/* Time range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Start Time <span className="text-red-400">*</span></label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={e => handleChange('startTime', e.target.value)}
                    className={input(errors.startTime)}
                  />
                  <FieldError msg={errors.startTime} />
                </div>
                <div>
                  <label className={label}>End Time <span className="text-red-400">*</span></label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={e => handleChange('endTime', e.target.value)}
                    className={input(errors.endTime)}
                  />
                  <FieldError msg={errors.endTime} />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className={label}>
                  Purpose <span className="text-red-400">*</span>
                  <span className={`ml-1 font-normal ${dark ? 'text-gray-600' : 'text-gray-400'}`}>(5–255 characters)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.purpose}
                  onChange={e => handleChange('purpose', e.target.value)}
                  placeholder="e.g. Team meeting for sprint planning"
                  maxLength={255}
                  className={input(errors.purpose)}
                />
                <div className="flex items-start justify-between mt-0.5">
                  <FieldError msg={errors.purpose} />
                  <span className={`text-xs ml-auto ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                    {form.purpose.length}/255
                  </span>
                </div>
              </div>

              {/* Expected attendees */}
              <div>
                <label className={label}>Expected Attendees <span className={`font-normal ${dark ? 'text-gray-600' : 'text-gray-400'}`}>(optional)</span></label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={form.expectedAttendees}
                  onChange={e => handleChange('expectedAttendees', e.target.value)}
                  placeholder="e.g. 10"
                  className={input(errors.expectedAttendees)}
                />
                <FieldError msg={errors.expectedAttendees} />
              </div>

              {/* Info note */}
              <div className={`flex items-start gap-2 text-xs p-3 rounded-xl ${dark ? 'bg-indigo-500/5 border border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border border-indigo-100 text-indigo-700'}`}>
                <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                Your request will be reviewed by an administrator. You'll receive a notification once it's approved or rejected.
              </div>

              {/* Conflict banner — shown when 409 is returned */}
              {showConflictBanner && (
                <div className={`rounded-xl border p-4 ${dark ? 'bg-orange-500/5 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}>
                  <p className={`text-sm font-semibold mb-1 ${dark ? 'text-orange-300' : 'text-orange-800'}`}>
                    This resource is already booked for your selected time.
                  </p>
                  <p className={`text-xs mb-3 ${dark ? 'text-orange-400/80' : 'text-orange-700'}`}>
                    Would you like to join the waitlist? We'll notify you instantly if a slot opens up.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => setShowWaitlistModal(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-orange-600 hover:bg-orange-500 text-white transition-all"
                    >
                      <ListPlus size={13} /> Join Waitlist
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConflictBanner(false)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${dark ? 'border-orange-500/30 text-orange-400 hover:text-white' : 'border-orange-200 text-orange-700 hover:bg-orange-100'}`}
                    >
                      Choose Different Time
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/bookings')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${dark ? 'border-[#2a2a45] text-gray-400 hover:text-white hover:border-indigo-500/50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className={`rounded-2xl border p-4 ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-gray-200 shadow-sm'}`}>
              <p className={`text-xs uppercase tracking-wide mb-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Selected Slot</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Info size={14} className={dark ? 'text-indigo-400' : 'text-indigo-600'} />
                  <span className={dark ? 'text-white' : 'text-gray-900'}>
                    {selectedResource?.name || 'No resource selected'}
                  </span>
                </div>
                <div className={`flex items-center gap-2 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <CalendarDays size={14} />
                  <span>{form.date || 'Choose a booking date'}</span>
                </div>
                <div className={`flex items-center gap-2 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Clock3 size={14} />
                  <span>
                    {form.startTime && form.endTime ? `${form.startTime} - ${form.endTime}` : 'Choose a time range'}
                  </span>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl border p-4 ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-gray-200 shadow-sm'}`}>
              <p className={`text-xs uppercase tracking-wide mb-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Workflow</p>
              <ol className={`text-sm space-y-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>1. Select resource, date, and time window.</li>
                <li>2. Add purpose and optional attendees.</li>
                <li>3. Submit for admin review.</li>
                <li>4. If conflict exists, join waitlist for notifications.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Waitlist Join Modal — appears when user chooses to join after conflict */}
      {showWaitlistModal && (
        <WaitlistJoinModal
          dark={dark}
          prefill={{
            resourceId:        form.resourceId,
            resourceName:      selectedResource?.name || 'Selected Resource',
            date:              form.date,
            startTime:         form.startTime,
            endTime:           form.endTime,
            purpose:           form.purpose,
            expectedAttendees: form.expectedAttendees,
          }}
          onClose={() => setShowWaitlistModal(false)}
          onSuccess={() => {
            setShowConflictBanner(false)
            navigate('/waitlist')
          }}
        />
      )}
    </Layout>
  )
}
