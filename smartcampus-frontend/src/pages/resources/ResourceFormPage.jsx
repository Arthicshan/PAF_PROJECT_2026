import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, X, Loader2, Save } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import { resourceApi } from '../../api/resourceApi'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'

const TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
const AMENITIES = ['projector', 'AC', 'whiteboard', 'smart_board', 'wifi']
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

const defaultForm = {
  name: '', type: 'LAB', capacity: '', location: '',
  status: 'ACTIVE', imageUrl: '', amenities: [], tags: [], availabilityWindows: []
}

export default function ResourceFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { dark } = useTheme()
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [tagInput, setTagInput] = useState('')
  const [windowInput, setWindowInput] = useState({ day: 'MONDAY', startTime: '08:00', endTime: '17:00' })

  useEffect(() => {
    if (!isEdit) return
        ;(async () => {
      try {
        const res = await resourceApi.getById(id)
        const r = res.data?.data || res.data
        setForm({
          name: r.name || '',
          type: r.type || 'LAB',
          capacity: r.capacity || '',
          location: r.location || '',
          status: r.status || 'ACTIVE',
          imageUrl: r.imageUrl || '',
          amenities: r.amenities || [],
          tags: r.tags || [],
          availabilityWindows: typeof r.availabilityWindows === 'string'
              ? JSON.parse(r.availabilityWindows || '[]')
              : (r.availabilityWindows || []),
        })
      } catch { toast.error('Failed to load resource') }
      finally { setFetching(false) }
    })()
  }, [id])

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const toggleAmenity = (a) => {
    set('amenities', form.amenities.includes(a)
        ? form.amenities.filter(x => x !== a)
        : [...form.amenities, a])
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.tags.includes(t)) {
      set('tags', [...form.tags, t])
      setTagInput('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        availabilityWindows: JSON.stringify(form.availabilityWindows),
      }
      if (isEdit) {
        await resourceApi.update(id, payload)
        toast.success('Resource updated!')
        navigate(`/resources/${id}`)
      } else {
        const res = await resourceApi.create(payload)
        const newId = res.data?.data?.id
        toast.success('Resource created! AI description generating...')
        navigate(newId ? `/resources/${newId}` : '/resources')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save resource')
    } finally {
      setLoading(false)
    }
  }

  const inp = `
    w-full px-3 py-2.5 rounded-xl text-sm border transition-all input-focus font-body
    ${dark ? 'bg-[#1e1e35] border-[#2a2a45] text-white placeholder-gray-600' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}
  `
  const lbl = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`
  const card = `rounded-2xl p-6 border ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-indigo-100 shadow-sm'}`

  if (fetching) return (
      <Layout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
  )

  return (
      <Layout title={isEdit ? 'Edit Resource' : 'Add Resource'} subtitle={isEdit ? 'Update resource details' : 'Create a new campus resource'}>
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">

          {/* Back */}
          <button type="button" onClick={() => navigate(-1)} className={`flex items-center gap-2 text-sm ${dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
            <ArrowLeft size={16} /> Back
          </button>

          {/* Basic info */}
          <div className={card}>
            <h2 className={`font-display font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Basic information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Resource name *</label>
                <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Lab A201" className={inp} />
              </div>
              <div>
                <label className={lbl}>Type *</label>
                <select value={form.type} onChange={e => set('type', e.target.value)} className={inp}>
                  {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Location *</label>
                <input required value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Block A, Floor 2, Room 201" className={inp} />
              </div>
              <div>
                <label className={lbl}>Capacity</label>
                <input type="number" min={1} value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="e.g. 30" className={inp} />
              </div>
              <div>
                <label className={lbl}>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className={inp}>
                  <option value="ACTIVE">Active</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Image URL</label>
                <input value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." className={inp} />
              </div>
            </div>
            {form.imageUrl && (
                <div className="mt-3">
                  <img src={form.imageUrl} alt="Preview" className="h-32 rounded-xl object-cover" onError={e => e.target.style.display = 'none'} />
                </div>
            )}
          </div>

          {/* Amenities */}
          <div className={card}>
            <h2 className={`font-display font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Amenities</h2>
            <div className="flex flex-wrap gap-3">
              {AMENITIES.map(a => (
                  <button
                      key={a} type="button" onClick={() => toggleAmenity(a)}
                      className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all capitalize
                  ${form.amenities.includes(a)
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : dark ? 'border-[#2a2a45] text-gray-400 hover:border-indigo-500/50' : 'border-gray-200 text-gray-600 hover:border-indigo-200'
                      }
                `}
                  >
                    {a.replace('_', ' ')}
                  </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className={card}>
            <h2 className={`font-display font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Tags <span className={`text-xs font-normal ${dark ? 'text-gray-500' : 'text-gray-400'}`}>(used for AI search)</span></h2>
            <div className="flex gap-2 mb-3">
              <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag and press Enter"
                  className={`${inp} flex-1`}
              />
              <button type="button" onClick={addTag} className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm hover:bg-indigo-600 transition-colors">
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map(tag => (
                  <span key={tag} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${dark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-600'}`}>
                #{tag}
                    <button type="button" onClick={() => set('tags', form.tags.filter(t => t !== tag))}>
                  <X size={10} />
                </button>
              </span>
              ))}
            </div>
          </div>

          {/* Availability Windows */}
          <div className={card}>
            <h2 className={`font-display font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>
              Availability Windows
              <span className={`text-xs font-normal ml-2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>(when this resource can be booked)</span>
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <select
                  value={windowInput.day}
                  onChange={e => setWindowInput(w => ({ ...w, day: e.target.value }))}
                  className={`${inp} flex-1 min-w-[130px]`}
              >
                {DAYS.map(d => <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}
              </select>
              <input
                  type="time"
                  value={windowInput.startTime}
                  onChange={e => setWindowInput(w => ({ ...w, startTime: e.target.value }))}
                  className={`${inp} flex-1 min-w-[110px]`}
              />
              <span className={`self-center text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>to</span>
              <input
                  type="time"
                  value={windowInput.endTime}
                  onChange={e => setWindowInput(w => ({ ...w, endTime: e.target.value }))}
                  className={`${inp} flex-1 min-w-[110px]`}
              />
              <button
                  type="button"
                  onClick={() => {
                    if (windowInput.startTime >= windowInput.endTime) {
                      toast.error('End time must be after start time')
                      return
                    }
                    set('availabilityWindows', [...form.availabilityWindows, { ...windowInput }])
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm hover:bg-indigo-600 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {form.availabilityWindows.length === 0 && (
                  <p className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>No windows added yet — resource will have no bookable hours.</p>
              )}
              {form.availabilityWindows.map((w, i) => (
                  <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-xl border text-sm ${dark ? 'bg-[#1e1e35] border-[#2a2a45] text-gray-300' : 'bg-indigo-50 border-indigo-100 text-gray-700'}`}>
                    <span className="font-medium">{w.day.charAt(0) + w.day.slice(1).toLowerCase()}</span>
                    <span className={dark ? 'text-gray-400' : 'text-gray-500'}>{w.startTime} – {w.endTime}</span>
                    <button
                        type="button"
                        onClick={() => set('availabilityWindows', form.availabilityWindows.filter((_, idx) => idx !== i))}
                        className={`ml-2 ${dark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors`}
                    >
                      <X size={14} />
                    </button>
                  </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className={`px-5 py-2.5 rounded-xl text-sm border transition-all ${dark ? 'border-[#2a2a45] text-gray-400 hover:text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              Cancel
            </button>
            <button
                type="submit" disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 glow-primary"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {loading ? 'Saving...' : isEdit ? 'Update resource' : 'Create resource'}
            </button>
          </div>
        </form>
      </Layout>
  )
}