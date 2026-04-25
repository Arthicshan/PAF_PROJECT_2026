import { ListX } from 'lucide-react'
import WaitlistCard from './WaitlistCard'

export default function WaitlistList({ entries, dark, onRemove, onConfirm, emptyMessage = 'No waitlist entries found.' }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${dark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
          <ListX size={20} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
        </div>
        <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map(entry => (
        <WaitlistCard
          key={entry.id}
          entry={entry}
          dark={dark}
          onRemove={onRemove}
          onConfirm={onConfirm}
        />
      ))}
    </div>
  )
}
