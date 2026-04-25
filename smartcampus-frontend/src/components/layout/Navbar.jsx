import { Bell } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useEffect, useState } from "react"
import api from "../../api/axiosInstance"
import { useNavigate } from "react-router-dom"

export default function Navbar({ title, subtitle }) {
  const { dark } = useTheme()
  const navigate = useNavigate()

  const [unread, setUnread] = useState(0)

  useEffect(() => {
    api.get("/api/v1/notifications/unread-count")
        .then(res => setUnread(res.data.unreadCount))
        .catch(() => {})
  }, [])

  return (
      <header className={`
      fixed top-0 left-64 right-0 h-16 z-30 flex items-center justify-between px-6
      ${dark
          ? 'bg-[#0f0f1a]/80 border-b border-[#2a2a45] backdrop-blur-md'
          : 'bg-white/80 border-b border-indigo-100 backdrop-blur-md'
      }
    `}>

        {/* TITLE */}
        <div>
          <h2 className={`font-semibold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          {subtitle && (
              <p className={`text-xs ${dark ? 'text-indigo-400' : 'text-indigo-500'}`}>
                {subtitle}
              </p>
          )}
        </div>

        {/* NOTIFICATION */}
        <button
            onClick={() => navigate("/notifications")}
            className={`relative p-2 rounded-lg transition ${
                dark
                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                    : 'text-gray-500 hover:bg-gray-100'
            }`}
        >
          <Bell size={18} />

          {unread > 0 && (
              <span className="absolute top-1 right-1 text-[10px] bg-indigo-500 text-white rounded-full px-1">
            {unread}
          </span>
          )}
        </button>

      </header>
  )
}