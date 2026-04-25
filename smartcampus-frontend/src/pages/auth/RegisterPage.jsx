import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Lock, Mail, Moon, Sun, User, Zap } from 'lucide-react'
import api from '../../api/axiosInstance'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function RegisterPage() {
  const { token, login } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (token) navigate('/resources', { replace: true })
  }, [token, navigate])

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post('/api/v1/auth/register', form)
      login(data.data.token)
      toast.success('Account created successfully')
      navigate('/resources', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create account')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${dark ? 'bg-[#0a0a14]' : 'bg-slate-50'}`}>
      <button
        type="button"
        onClick={toggle}
        className={`absolute top-6 right-6 p-2 rounded-lg transition-colors ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:bg-gray-100'}`}
        aria-label="Toggle theme"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className={`w-full max-w-md rounded-2xl p-7 border ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-indigo-100 shadow-xl shadow-indigo-100'}`}>
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`font-display font-bold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>Create Account</h1>
            <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-500'}`}>Join Smart Campus Operations Hub</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldShell dark={dark} icon={<User size={16} />}>
            <input
              type="text"
              value={form.name}
              onChange={updateField('name')}
              required
              placeholder="Full name"
              className="w-full bg-transparent outline-none text-sm"
            />
          </FieldShell>

          <FieldShell dark={dark} icon={<Mail size={16} />}>
            <input
              type="email"
              value={form.email}
              onChange={updateField('email')}
              required
              placeholder="Email address"
              className="w-full bg-transparent outline-none text-sm"
            />
          </FieldShell>

          <FieldShell dark={dark} icon={<Lock size={16} />}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={updateField('password')}
              required
              minLength={6}
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
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className={`mt-6 text-center text-sm ${dark ? 'text-gray-500' : 'text-gray-500'}`}>
          Already have an account?{' '}
          <Link to="/login" className={dark ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-700'}>
            Sign in
          </Link>
        </p>
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
