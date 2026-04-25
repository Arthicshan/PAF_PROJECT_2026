import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Loader2, Zap } from 'lucide-react'

export default function OAuthCallback() {
  const [params] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      login(token)
      navigate('/resources', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a14]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Zap size={24} className="text-white" />
        </div>
        <Loader2 size={20} className="text-indigo-400 animate-spin" />
        <p className="text-indigo-300 text-sm font-body">Signing you in to Smart Campus...</p>
      </div>
    </div>
  )
}
