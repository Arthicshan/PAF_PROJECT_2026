export default function StatusBadge({ status, size = 'sm' }) {
  const styles = {
    ACTIVE: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    OUT_OF_SERVICE: 'bg-red-500/15 text-red-400 border border-red-500/25',
    UNDER_MAINTENANCE: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  }
  const dots = {
    ACTIVE: 'bg-emerald-400',
    OUT_OF_SERVICE: 'bg-red-400',
    UNDER_MAINTENANCE: 'bg-amber-400',
  }
  const labels = {
    ACTIVE: 'Active',
    OUT_OF_SERVICE: 'Out of Service',
    UNDER_MAINTENANCE: 'Maintenance',
  }

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-medium
      ${size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}
      ${styles[status] || 'bg-gray-500/15 text-gray-400 border border-gray-500/25'}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || 'bg-gray-400'}`} />
      {labels[status] || status}
    </span>
  )
}
