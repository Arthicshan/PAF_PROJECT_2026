import { useTheme } from '../../context/ThemeContext'
import { X } from 'lucide-react'

const TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
const STATUSES = ['ACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE']
const AMENITIES = ['projector', 'AC', 'whiteboard', 'smart_board', 'wifi']

export default function FilterSidebar({ filters, onChange, onReset }) {
  const { dark } = useTheme()

  const handleChange = (key, value) => onChange({ ...filters, [key]: value })

  const toggleAmenity = (a) => {
    const current = filters.amenities || []
    const updated = current.includes(a) ? current.filter(x => x !== a) : [...current, a]
    handleChange('amenities', updated)
  }

  const hasFilters = filters.type || filters.status || (filters.amenities?.length > 0) || filters.location

  const input = `
    w-full px-3 py-2 rounded-lg text-sm border transition-all input-focus font-body
    ${dark
      ? 'bg-[#1e1e35] border-[#2a2a45] text-white placeholder-gray-600'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
    }
  `

  const label = `block text-xs font-semibold uppercase tracking-wider mb-2 ${dark ? 'text-indigo-400' : 'text-indigo-600'}`

  return (
    <aside className={`
      w-56 flex-shrink-0 rounded-2xl p-4 h-fit
      ${dark ? 'bg-[#16162a] border border-[#2a2a45]' : 'bg-white border border-indigo-100 shadow-sm'}
    `}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-display font-semibold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>Filters</h3>
        {hasFilters && (
          <button
            onClick={onReset}
            className={`text-xs flex items-center gap-1 transition-colors ${dark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-500 hover:text-indigo-600'}`}
          >
            <X size={12} /> Reset
          </button>
        )}
      </div>

      {/* Location */}
      <div className="mb-4">
        <label className={label}>Location</label>
        <input
          type="text"
          placeholder="e.g. Block A"
          value={filters.location || ''}
          onChange={e => handleChange('location', e.target.value)}
          className={input}
        />
      </div>

      {/* Type */}
      <div className="mb-4">
        <label className={label}>Type</label>
        <select
          value={filters.type || ''}
          onChange={e => handleChange('type', e.target.value)}
          className={input}
        >
          <option value="">All types</option>
          {TYPES.map(t => (
            <option key={t} value={t}>{t.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="mb-4">
        <label className={label}>Status</label>
        <select
          value={filters.status || ''}
          onChange={e => handleChange('status', e.target.value)}
          className={input}
        >
          <option value="">All statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Capacity */}
      <div className="mb-4">
        <label className={label}>Min Capacity</label>
        <input
          type="number"
          placeholder="e.g. 20"
          min={1}
          value={filters.minCapacity || ''}
          onChange={e => handleChange('minCapacity', e.target.value)}
          className={input}
        />
      </div>

      {/* Amenities */}
      <div>
        <label className={label}>Amenities</label>
        <div className="space-y-2">
          {AMENITIES.map(a => (
            <label key={a} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => toggleAmenity(a)}
                className={`
                  w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer flex-shrink-0
                  ${(filters.amenities || []).includes(a)
                    ? 'bg-indigo-500 border-indigo-500'
                    : dark ? 'border-[#3a3a55] bg-[#1e1e35]' : 'border-gray-300 bg-white'
                  }
                `}
              >
                {(filters.amenities || []).includes(a) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                className={`text-xs font-body capitalize ${dark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'} transition-colors`}
                onClick={() => toggleAmenity(a)}
              >
                {a.replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
}
