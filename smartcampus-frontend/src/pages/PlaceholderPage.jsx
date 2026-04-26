import Layout from '../components/layout/Layout'
import { useTheme } from '../context/ThemeContext'
import { Construction } from 'lucide-react'

export default function PlaceholderPage({ title, subtitle }) {
  const { dark } = useTheme()
  return (
    <Layout title={title} subtitle={subtitle}>
      <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border ${dark ? 'border-[#2a2a45] bg-[#16162a]' : 'border-indigo-100 bg-white'}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${dark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
          <Construction size={28} className={dark ? 'text-amber-400' : 'text-amber-500'} />
        </div>
        <h3 className={`font-display font-semibold text-lg mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>{title} — Coming Soon</h3>
        <p className={`text-sm text-center max-w-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
          This module is under development. Check back soon!
        </p>
      </div>
    </Layout>
  )
}
