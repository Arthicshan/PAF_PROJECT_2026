import { useTheme } from '../../context/ThemeContext'

export default function SkeletonCard() {
  const { dark } = useTheme()
  const cls = dark ? 'skeleton' : 'skeleton-light'

  return (
    <div className={`rounded-2xl overflow-hidden ${dark ? 'bg-[#16162a] border border-[#2a2a45]' : 'bg-white border border-gray-100'}`}>
      <div className={`h-36 w-full ${cls} rounded-none`} />
      <div className="p-4 space-y-3">
        <div className={`h-4 w-3/4 rounded-lg ${cls}`} />
        <div className={`h-3 w-1/2 rounded-lg ${cls}`} />
        <div className={`h-3 w-2/3 rounded-lg ${cls}`} />
        <div className="flex gap-2 pt-1">
          <div className={`h-5 w-16 rounded-md ${cls}`} />
          <div className={`h-5 w-12 rounded-md ${cls}`} />
          <div className={`h-5 w-14 rounded-md ${cls}`} />
        </div>
      </div>
    </div>
  )
}
