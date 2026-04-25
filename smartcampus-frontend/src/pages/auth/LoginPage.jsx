import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Building2, Eye, EyeOff, Lock, Mail, Moon, Shield, Sparkles, Sun, Zap } from 'lucide-react'
import api from '../../api/axiosInstance'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function LoginPage() {
  const { token, login } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (token) navigate('/resources', { replace: true })
  }, [token, navigate])

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/google`
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post('/api/v1/auth/login', { email, password })
      login(data.data.token)
      toast.success('Signed in successfully')
      navigate('/resources', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid email or password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen flex ${dark ? 'bg-[#0a0a14]' : 'bg-slate-50'}`}>
      <AuthBrandPanel dark={dark} />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <button
          type="button"
          onClick={toggle}
          className={`absolute top-6 right-6 p-2 rounded-lg transition-colors ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:bg-gray-100'}`}
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <MobileLogo dark={dark} />

        <div className={`w-full max-w-sm rounded-2xl p-7 border ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-indigo-100 shadow-xl shadow-indigo-100'}`}>
          <div className="mb-6">
            <h2 className={`font-display font-bold text-2xl mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
              Welcome back
            </h2>
            <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-500'}`}>
              Sign in with your campus account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldShell dark={dark} icon={<Mail size={16} />} >
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="Email address"
                className="w-full bg-transparent outline-none text-sm"
              />
            </FieldShell>

            <FieldShell dark={dark} icon={<Lock size={16} />}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="Password"
                className="w-full bg-transparent outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className={dark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-700'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </FieldShell>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className={`flex-1 h-px ${dark ? 'bg-[#2a2a45]' : 'bg-gray-100'}`} />
            <span className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>or</span>
            <div className={`flex-1 h-px ${dark ? 'bg-[#2a2a45]' : 'bg-gray-100'}`} />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition ${dark ? 'bg-white/5 border-[#3a3a55] text-white hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <p className={`mt-6 text-center text-sm ${dark ? 'text-gray-500' : 'text-gray-500'}`}>
            New to Smart Campus?{' '}
            <Link to="/register" className={dark ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-700'}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function AuthBrandPanel({ dark }) {
  return (
    <div className={`hidden lg:flex lg:w-1/2 flex-col justify-between p-12 ${dark ? 'bg-[#111827]' : 'bg-indigo-700'}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-white text-lg">Smart Campus</h1>
          <p className="text-indigo-200 text-xs">Operations Hub</p>
        </div>
      </div>

      <div>
        <h2 className="font-display font-bold text-white text-4xl leading-tight mb-4">
          Your campus,<br />
          <span className="text-indigo-200">intelligently managed.</span>
        </h2>
        <p className="text-indigo-100 text-sm leading-relaxed mb-8 max-w-md">
          Book facilities, manage incidents, and receive real-time updates across campus.
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { icon: Building2, label: 'Facility booking' },
            { icon: Sparkles, label: 'Smart search' },
            { icon: Shield, label: 'Role access' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
              <Icon size={12} className="text-indigo-200" />
              <span className="text-white text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-indigo-200 text-xs">SLIIT · IT3030 PAF 2026</p>
    </div>
  )
}

function MobileLogo({ dark }) {
  return (
    <div className="lg:hidden flex items-center gap-3 mb-8">
      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
        <Zap size={20} className="text-white" />
      </div>
      <div>
        <h1 className={`font-display font-bold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>Smart Campus</h1>
        <p className={`text-xs ${dark ? 'text-indigo-400' : 'text-indigo-500'}`}>Operations Hub</p>
      </div>
    </div>
  )
}

function FieldShell({ dark, icon, children }) {
  return (
    <label className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${dark ? 'border-[#2a2a45] bg-white/5 text-gray-200 focus-within:border-indigo-400' : 'border-gray-200 bg-white text-gray-900 focus-within:border-indigo-400'}`}>
      <span className={dark ? 'text-gray-500' : 'text-gray-400'}>{icon}</span>
      {children}
    </label>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.6 39.4 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2c3.7-3.4 5.8-8.5 5.8-14.8 0-1.3-.1-2.7-.1-4z" />
    </svg>
  )
}
