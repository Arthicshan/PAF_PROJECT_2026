import { useState, useEffect } from 'react'
import { Shield, User, Search, Loader2, CheckCircle } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axiosInstance'
import toast from 'react-hot-toast'

export default function UsersPage() {
    const { dark } = useTheme()
    const [users, setUsers] = useState([])
    const [myProfile, setMyProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleLoading, setRoleLoading] = useState(null)

    useEffect(() => {
        (async () => {
            try {
                const [allRes, meRes] = await Promise.all([
                    api.get('/api/v1/users'),
                    api.get('/api/v1/users/me')
                ])
                setUsers(allRes.data?.data || allRes.data || [])
                setMyProfile(meRes.data?.data || meRes.data)
            } catch {
                toast.error('Failed to load users')
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const handleRoleChange = async (userId, newRole) => {
        setRoleLoading(userId)
        try {
            await api.patch(`/api/v1/users/${userId}/role?role=${newRole}`)
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
            toast.success(`Role updated to ${newRole}`)
        } catch {
            toast.error('Failed to update role')
        } finally {
            setRoleLoading(null)
        }
    }

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    )

    const card = `rounded-2xl p-5 border ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-indigo-100 shadow-sm'}`
    const inp = `w-full px-3 py-2.5 rounded-xl text-sm border transition-all ${dark ? 'bg-[#1e1e35] border-[#2a2a45] text-white placeholder-gray-600' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`

    const roleBadge = (role) => {
        const s = {
            ADMIN: dark ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-purple-50 text-purple-600',
            USER:  dark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-600',
        }
        return `text-xs px-2.5 py-1 rounded-full font-medium ${s[role] || s.USER}`
    }

    return (
        <Layout title="User Management" subtitle="Manage campus users and roles">
            <div className="max-w-5xl space-y-5">

                {/* My Profile */}
                {myProfile && (
                    <div className={card}>
                        <div className="flex items-center gap-2 mb-3">
                            <User size={16} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
                            <h2 className={`font-display font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>My Profile</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            {myProfile.pictureUrl ? (
                                <img src={myProfile.pictureUrl} alt={myProfile.name} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                    {myProfile.name?.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className={`font-medium ${dark ? 'text-white' : 'text-gray-900'}`}>{myProfile.name}</p>
                                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{myProfile.email}</p>
                                <p className={`text-xs mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Joined {new Date(myProfile.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`ml-auto ${roleBadge(myProfile.role)}`}>{myProfile.role}</span>
                        </div>
                    </div>
                )}

                {/* All Users */}
                <div className={card}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Shield size={16} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
                            <h2 className={`font-display font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>All Users</h2>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-[#1e1e35] text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                {users.length}
              </span>
                        </div>
                    </div>

                    <div className="relative mb-4">
                        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className={`${inp} pl-8`} />
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12 gap-2">
                            <Loader2 size={16} className="animate-spin text-indigo-400" />
                            <span className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Loading users...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className={`text-sm text-center py-8 ${dark ? 'text-gray-600' : 'text-gray-400'}`}>No users found</p>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map(u => (
                                <div key={u.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${dark ? 'border-[#2a2a45] bg-[#1e1e35]' : 'border-gray-100 bg-gray-50'}`}>
                                    {u.pictureUrl ? (
                                        <img src={u.pictureUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                            {u.name?.slice(0, 2).toUpperCase() || '??'}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{u.name}</p>
                                        <p className={`text-xs truncate ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{u.email}</p>
                                    </div>
                                    <span className={roleBadge(u.role)}>{u.role}</span>
                                    <div className="flex gap-1 ml-2">
                                        {['USER', 'ADMIN'].map(role => (
                                            <button
                                                key={role}
                                                disabled={u.role === role || roleLoading === u.id}
                                                onClick={() => handleRoleChange(u.id, role)}
                                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-all
                          ${u.role === role
                                                    ? dark ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400' : 'border-indigo-300 bg-indigo-50 text-indigo-600'
                                                    : dark ? 'border-[#2a2a45] text-gray-400 hover:text-white hover:border-[#3a3a55]' : 'border-gray-200 text-gray-500 hover:bg-gray-100'
                                                }
                          ${roleLoading === u.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {roleLoading === u.id ? <Loader2 size={10} className="animate-spin" /> : u.role === role ? <CheckCircle size={10} /> : null}
                                                {role}
                                            </button>
                                        ))}
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