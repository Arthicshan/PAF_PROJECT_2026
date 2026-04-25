import { useState } from 'react'
import { Search, Sparkles, Loader2, X } from 'lucide-react'
import { resourceApi } from '../../api/resourceApi'
import { useTheme } from '../../context/ThemeContext'

export default function AISearchBar({ onResults, onClear }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const { dark } = useTheme()

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await resourceApi.search(query)
      onResults(res.data?.data || [])
      setSearched(true)
    } catch {
      onResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setSearched(false)
    onClear()
  }

  return (
    <div className={`
      relative flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all
      ${dark
        ? 'bg-[#16162a] border-[#2a2a45] focus-within:border-indigo-500/60'
        : 'bg-white border-indigo-100 focus-within:border-indigo-300 shadow-sm'
      }
    `}>
      {/* AI Sparkle icon */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Sparkles size={16} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
        <span className={`text-xs font-semibold font-body ${dark ? 'text-indigo-400' : 'text-indigo-500'}`}>
          AI Search
        </span>
        <div className={`w-px h-4 ${dark ? 'bg-[#2a2a45]' : 'bg-indigo-100'}`} />
      </div>

      {/* Input */}
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        placeholder="Describe what you need — e.g. quiet room for 10 people with projector near Block A"
        className={`
          flex-1 bg-transparent text-sm outline-none font-body
          ${dark ? 'text-white placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'}
        `}
      />

      {/* Clear */}
      {searched && (
        <button
          onClick={handleClear}
          className={`flex-shrink-0 p-1 rounded-lg transition-colors ${dark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <X size={14} />
        </button>
      )}

      {/* Search button */}
      <button
        onClick={handleSearch}
        disabled={loading || !query.trim()}
        className={`
          flex-shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium transition-all
          ${loading || !query.trim()
            ? dark ? 'bg-indigo-900/30 text-indigo-600 cursor-not-allowed' : 'bg-indigo-50 text-indigo-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 glow-primary'
          }
        `}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Search size={14} />
        )}
        <span>{loading ? 'Searching...' : 'Search'}</span>
      </button>
    </div>
  )
}
