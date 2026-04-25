import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useTheme } from '../../context/ThemeContext'

export default function Layout({ children, title, subtitle }) {
  const { dark } = useTheme()

  return (
    <div className={`min-h-screen ${dark ? 'bg-[#0a0a14]' : 'bg-slate-50'}`}>
      <Sidebar />
      <Navbar title={title} subtitle={subtitle} />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
