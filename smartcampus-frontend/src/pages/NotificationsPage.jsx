import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, Loader2 } from 'lucide-react'
import Layout from "../components/layout/Layout"
import { useTheme } from "../context/ThemeContext"
import api from "../api/axiosInstance"
import toast from 'react-hot-toast'

export default function NotificationsPage() {
    const { dark } = useTheme()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)
    const [markingAll, setMarkingAll] = useState(false)

    useEffect(() => {
        (async () => {
            try {
                const [notifRes, countRes] = await Promise.all([
                    api.get('/api/v1/notifications'),
                    api.get('/api/v1/notifications/unread-count')
                ])
                const data = notifRes.data?.content || notifRes.data?.data?.content || notifRes.data?.data || []
                setNotifications(data)
                setUnreadCount(countRes.data?.unreadCount ?? countRes.data?.data?.unreadCount ?? 0)
            } catch {
                toast.error('Failed to load notifications')
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const markAsRead = async (id) => {
        try {
            await api.patch(`/api/v1/notifications/${id}/read`)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
            setUnreadCount(c => Math.max(0, c - 1))
        } catch {
            toast.error('Failed to mark as read')
        }
    }

    const markAllRead = async () => {
        setMarkingAll(true)
        try {
            await api.patch('/api/v1/notifications/read-all')
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
            toast.success('All notifications marked as read')
        } catch {
            toast.error('Failed to mark all as read')
        } finally {
            setMarkingAll(false)
        }
    }

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/api/v1/notifications/${id}`)
            const deleted = notifications.find(n => n.id === id)
            setNotifications(prev => prev.filter(n => n.id !== id))
            if (deleted && !deleted.read) setUnreadCount(c => Math.max(0, c - 1))
            toast.success('Notification deleted')
        } catch {
            toast.error('Failed to delete notification')
        }
    }

    const timeAgo = (dateStr) => {
        if (!dateStr) return ''
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'just now'
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        return `${Math.floor(hrs / 24)}d ago`
    }

    const card = `rounded-2xl p-5 border ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-indigo-100 shadow-sm'}`

    return (
        <Layout title="Notifications" subtitle="Your activity and alerts">
            <div className="max-w-3xl space-y-5">
                <div className={card}>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
                            <h2 className={`font-display font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Notifications</h2>
                            {unreadCount > 0 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500 text-white font-medium">
                  {unreadCount} unread
                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                disabled={markingAll}
                                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all
                  ${dark ? 'border-[#2a2a45] text-gray-400 hover:text-white hover:border-indigo-500/50' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                            >
                                {markingAll ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />}
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12 gap-2">
                            <Loader2 size={16} className="animate-spin text-indigo-400" />
                            <span className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Loading notifications...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${dark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                                <Bell size={24} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
                            </div>
                            <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {notifications.map(n => (
                                <div key={n.id}
                                     className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-all
                    ${!n.read
                                         ? dark ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-indigo-100 bg-indigo-50/50'
                                         : dark ? 'border-[#2a2a45] bg-[#1e1e35]' : 'border-gray-100 bg-gray-50'
                                     }`}
                                >
                                    {/* Unread dot */}
                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-indigo-500' : dark ? 'bg-[#2a2a45]' : 'bg-gray-200'}`} />

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${dark ? 'text-white' : 'text-gray-900'}`}>{n.title || n.type}</p>
                                        {n.message && <p className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{n.message}</p>}
                                        <p className={`text-xs mt-1 ${dark ? 'text-gray-600' : 'text-gray-400'}`}>{timeAgo(n.createdAt)}</p>
                                    </div>

                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {!n.read && (
                                            <button
                                                onClick={() => markAsRead(n.id)}
                                                title="Mark as read"
                                                className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10' : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50'}`}
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(n.id)}
                                            title="Delete"
                                            className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}