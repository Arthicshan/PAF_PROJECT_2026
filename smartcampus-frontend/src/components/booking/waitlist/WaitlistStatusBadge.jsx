const CONFIG = {
  WAITING:   { label: 'Waiting',   bg: 'bg-blue-100',   text: 'text-blue-800',   darkBg: 'bg-blue-500/10',   darkText: 'text-blue-400',   dot: 'bg-blue-400'   },
  NOTIFIED:  { label: 'Notified',  bg: 'bg-orange-100', text: 'text-orange-800', darkBg: 'bg-orange-500/10', darkText: 'text-orange-400', dot: 'bg-orange-400', pulse: true },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-green-100',  text: 'text-green-800',  darkBg: 'bg-green-500/10',  darkText: 'text-green-400',  dot: 'bg-green-400'  },
  EXPIRED:   { label: 'Expired',   bg: 'bg-gray-100',   text: 'text-gray-600',   darkBg: 'bg-gray-500/10',   darkText: 'text-gray-400',   dot: 'bg-gray-400'   },
  REMOVED:   { label: 'Removed',   bg: 'bg-red-100',    text: 'text-red-700',    darkBg: 'bg-red-500/10',    darkText: 'text-red-400',    dot: 'bg-red-400'    },
}

export default function WaitlistStatusBadge({ status, dark }) {
  const c = CONFIG[status]
  if (!c) return null

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg
      ${dark ? `${c.darkBg} ${c.darkText}` : `${c.bg} ${c.text}`}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot} ${c.pulse ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  )
}
