import { Sparkles, Loader2 } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function AISummaryCard({ summary, loading }) {
  const { dark } = useTheme()

  return (
    <div className={`rounded-xl p-4 border ${dark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={14} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
        <span className={`text-xs font-semibold ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>AI-generated overview</span>
      </div>
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 size={12} className="animate-spin text-indigo-400" />
          <span className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Generating description...</span>
        </div>
      ) : summary ? (
        <p className={`text-sm leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{summary}</p>
      ) : (
        <p className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>No AI summary available yet.</p>
      )}
    </div>
  )
}
