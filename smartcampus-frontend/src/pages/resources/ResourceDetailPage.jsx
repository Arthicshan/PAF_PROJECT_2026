import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, MapPin, Users, Calendar, AlertTriangle, CheckCircle, TrendingUp, Sparkles, BarChart2, Loader2, Star, Clock, CheckCircle2, XCircle } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import StatusBadge from '../../components/common/StatusBadge'
import AISummaryCard from '../../components/resources/AISummaryCard'
import QRCodeDisplay from '../../components/resources/QRCodeDisplay'
import { resourceApi } from '../../api/resourceApi'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'

export default function ResourceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { dark } = useTheme()

  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  // Availability state
  const [availFrom, setAvailFrom] = useState('')
  const [availTo, setAvailTo] = useState('')
  const [availResult, setAvailResult] = useState(null)
  const [availLoading, setAvailLoading] = useState(false)

  // Review state
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  // AI Recommend state
  const [recDate, setRecDate] = useState('')
  const [recTimeRange, setRecTimeRange] = useState('09:00-11:00')
  const [recResult, setRecResult] = useState(null)
  const [recLoading, setRecLoading] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const res = await resourceApi.getById(id)
        setResource(res.data?.data || res.data)
      } catch {
        toast.error('Failed to load resource')
        navigate('/resources')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  useEffect(() => {
    (async () => {
      try {
        const res = await resourceApi.getAnalytics(id)
        setAnalytics(res.data?.data || res.data)
      } catch {}
      finally { setAnalyticsLoading(false) }
    })()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resource?')) return
    try {
      await resourceApi.delete(id)
      toast.success('Resource deleted')
      navigate('/resources')
    } catch {
      toast.error('Failed to delete resource')
    }
  }

  const handleStatusChange = async (status) => {
    setStatusLoading(true)
    try {
      await resourceApi.updateStatus(id, status)
      setResource(r => ({ ...r, status }))
      toast.success(`Status updated to ${status.replace('_', ' ')}`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  const handleCheckAvailability = async () => {
    if (!availFrom || !availTo) { toast.error('Please select both from and to dates'); return }
    setAvailLoading(true)
    setAvailResult(null)
    try {
      const res = await resourceApi.getAvailability(id, availFrom, availTo)
      setAvailResult(res.data?.data || res.data)
    } catch {
      toast.error('Failed to check availability')
    } finally {
      setAvailLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return }
    if (!comment.trim()) { toast.error('Please add a comment'); return }
    setReviewLoading(true)
    try {
      await resourceApi.addReview(id, { rating, comment })
      toast.success('Review submitted!')
      setRating(0)
      setComment('')
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setReviewLoading(false)
    }
  }

  const handleGetRecommendations = async () => {
    if (!recDate) { toast.error('Please select a date'); return }
    setRecLoading(true)
    setRecResult(null)
    try {
      const res = await resourceApi.getRecommendations({ resourceId: id, date: recDate, timeRange: recTimeRange })
      setRecResult(res.data?.data || res.data)
    } catch {
      toast.error('Failed to get recommendations')
    } finally {
      setRecLoading(false)
    }
  }

  const card = `rounded-2xl p-5 border ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-indigo-100 shadow-sm'}`
  const inp = `w-full px-3 py-2 rounded-xl text-sm border transition-all ${dark ? 'bg-[#1e1e35] border-[#2a2a45] text-white' : 'bg-white border-gray-200 text-gray-900'}`

  if (loading) {
    return (
        <Layout title="Loading...">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </Layout>
    )
  }

  if (!resource) return null

  return (
      <Layout title={resource.name} subtitle={resource.type?.replace('_', ' ')}>
        <div className="max-w-5xl space-y-5">

          {/* Back + actions */}
          <div className="flex items-center justify-between fade-in">
            <button onClick={() => navigate('/resources')} className={`flex items-center gap-2 text-sm transition-colors ${dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
              <ArrowLeft size={16} />
              <span>Back to resources</span>
            </button>
            {isAdmin() && (
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(`/resources/${id}/edit`)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${dark ? 'border-[#2a2a45] text-gray-400 hover:text-white hover:border-indigo-500/50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
            )}
          </div>

          {/* Hero image + info */}
          <div className={`${card} overflow-hidden fade-in fade-in-delay-1`}>
            {resource.imageUrl && (
                <div className="h-64 -mx-5 -mt-5 mb-5 overflow-hidden">
                  <img src={resource.imageUrl} alt={resource.name} className="w-full h-full object-cover" />
                </div>
            )}
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className={`font-display font-bold text-2xl ${dark ? 'text-white' : 'text-gray-900'}`}>{resource.name}</h1>
                  <StatusBadge status={resource.status} size="md" />
                </div>
                <div className={`flex flex-wrap gap-4 text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {resource.location && <span className="flex items-center gap-1.5"><MapPin size={14} />{resource.location}</span>}
                  {resource.capacity && <span className="flex items-center gap-1.5"><Users size={14} />Capacity: {resource.capacity}</span>}
                </div>
                {resource.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {resource.amenities.map(a => (
                          <span key={a} className={`text-xs px-2.5 py-1 rounded-lg capitalize ${dark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-600'}`}>
                      {a.replace('_', ' ')}
                    </span>
                      ))}
                    </div>
                )}
              </div>
              {resource.qrCode && <QRCodeDisplay value={resource.qrCode} resourceName={resource.name} />}
            </div>
          </div>

          {/* Two column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-4">

              {/* AI Summary */}
              <div className={`${card} fade-in fade-in-delay-2`}>
                <h2 className={`font-display font-semibold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>About this resource</h2>
                <AISummaryCard summary={resource.aiSummary} loading={false} />
              </div>

              {/* AI Analytics */}
              <div className={`${card} fade-in fade-in-delay-3`}>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 size={16} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
                  <h2 className={`font-display font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>AI Analytics</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${dark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Sparkles size={10} /> AI powered
                </span>
                </div>
                {analyticsLoading ? (
                    <div className="flex items-center gap-2 py-6 justify-center">
                      <Loader2 size={16} className="animate-spin text-indigo-400" />
                      <span className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Generating insights...</span>
                    </div>
                ) : analytics ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Type utilization rate</span>
                          <span className={`text-xs font-semibold ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>{analytics.utilizationRate}%</span>
                        </div>
                        <div className={`h-2 rounded-full ${dark ? 'bg-[#1e1e35]' : 'bg-gray-100'}`}>
                          <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700" style={{ width: `${Math.min(analytics.utilizationRate, 100)}%` }} />
                        </div>
                      </div>
                      <div className={`rounded-xl p-3 ${dark ? 'bg-[#1e1e35]' : 'bg-indigo-50'}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Sparkles size={12} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
                          <span className={`text-xs font-semibold ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>Insight</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{analytics.aiInsight}</p>
                      </div>
                      <div className={`rounded-xl p-3 ${dark ? 'bg-[#1a2535]' : 'bg-blue-50'}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <TrendingUp size={12} className={dark ? 'text-blue-400' : 'text-blue-500'} />
                          <span className={`text-xs font-semibold ${dark ? 'text-blue-400' : 'text-blue-600'}`}>Prediction</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{analytics.prediction}</p>
                      </div>
                    </div>
                ) : (
                    <p className={`text-sm text-center py-4 ${dark ? 'text-gray-600' : 'text-gray-400'}`}>Analytics unavailable</p>
                )}
              </div>

              {/* Availability Checker */}
              <div className={`${card} fade-in fade-in-delay-3`}>
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
                  <h2 className={`font-display font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Check Availability</h2>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className={`block text-xs mb-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>From</label>
                    <input type="datetime-local" value={availFrom} onChange={e => { setAvailFrom(e.target.value); setAvailResult(null) }} className={inp} />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>To</label>
                    <input type="datetime-local" value={availTo} onChange={e => { setAvailTo(e.target.value); setAvailResult(null) }} className={inp} />
                  </div>
                </div>
                <button onClick={handleCheckAvailability} disabled={availLoading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-all disabled:opacity-50">
                  {availLoading ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                  {availLoading ? 'Checking...' : 'Check'}
                </button>
                {availResult && (
                    <div className={`mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${availResult.available ? dark ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-green-50 text-green-700' : dark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-700'}`}>
                      {availResult.available ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {availResult.available ? 'Available for the selected time slot' : 'Not available for the selected time slot'}
                    </div>
                )}
              </div>

              {/* Leave a Review */}
              <div className={`${card} fade-in fade-in-delay-3`}>
                <div className="flex items-center gap-2 mb-4">
                  <Star size={16} className={dark ? 'text-amber-400' : 'text-amber-500'} />
                  <h2 className={`font-display font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Leave a Review</h2>
                </div>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}
                              className="transition-transform hover:scale-110">
                        <Star size={24} className={`${s <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : dark ? 'text-gray-600' : 'text-gray-300'} transition-colors`} />
                      </button>
                  ))}
                  {rating > 0 && <span className={`ml-2 text-sm self-center ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{rating}/5</span>}
                </div>
                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share your experience with this resource..."
                    rows={3}
                    className={`${inp} resize-none mb-3`}
                />
                <button onClick={handleSubmitReview} disabled={reviewLoading || rating === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-all disabled:opacity-50">
                  {reviewLoading ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>

              {/* AI Recommendations */}
              <div className={`${card} fade-in fade-in-delay-3`}>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className={dark ? 'text-purple-400' : 'text-purple-500'} />
                  <h2 className={`font-display font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>AI Recommendations</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${dark ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-purple-50 text-purple-600'}`}>
                  <Sparkles size={10} /> AI powered
                </span>
                </div>
                <p className={`text-xs mb-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Find similar alternative resources for a specific date and time.</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className={`block text-xs mb-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Date</label>
                    <input type="date" value={recDate} onChange={e => { setRecDate(e.target.value); setRecResult(null) }} className={inp} />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Time range</label>
                    <input type="text" value={recTimeRange} onChange={e => { setRecTimeRange(e.target.value); setRecResult(null) }} placeholder="e.g. 09:00-11:00" className={inp} />
                  </div>
                </div>
                <button onClick={handleGetRecommendations} disabled={recLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 mb-4">
                  {recLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {recLoading ? 'Finding alternatives...' : 'Get AI Recommendations'}
                </button>
                {recResult && (
                    <div className="space-y-3">
                      {recResult.recommendation && (
                          <div className={`rounded-xl p-3 text-xs leading-relaxed ${dark ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : 'bg-purple-50 text-purple-700'}`}>
                            {recResult.recommendation}
                          </div>
                      )}
                      {recResult.suggestions?.length > 0 && (
                          <div className="space-y-2">
                            {recResult.suggestions.map(s => (
                                <div key={s.id} onClick={() => navigate(`/resources/${s.id}`)}
                                     className={`flex items-center justify-between px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${dark ? 'border-[#2a2a45] hover:border-indigo-500/50 bg-[#1e1e35]' : 'border-gray-100 hover:border-indigo-200 bg-gray-50'}`}>
                                  <div>
                                    <p className={`text-sm font-medium ${dark ? 'text-white' : 'text-gray-900'}`}>{s.name}</p>
                                    <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{s.location} · Capacity {s.capacity}</p>
                                  </div>
                                  <StatusBadge status={s.status} size="sm" />
                                </div>
                            ))}
                          </div>
                      )}
                    </div>
                )}
              </div>

              {/* Admin status controls */}
              {isAdmin() && (
                  <div className={`${card} fade-in fade-in-delay-3`}>
                    <h2 className={`font-display font-semibold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>Status management</h2>
                    <div className="flex flex-wrap gap-2">
                      {['ACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'].map(s => (
                          <button key={s} disabled={statusLoading || resource.status === s} onClick={() => handleStatusChange(s)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all
                        ${resource.status === s ? dark ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400' : 'border-indigo-300 bg-indigo-50 text-indigo-600'
                                      : dark ? 'border-[#2a2a45] text-gray-400 hover:text-white hover:border-[#3a3a55]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}
                        ${statusLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {s === 'ACTIVE' && <CheckCircle size={12} />}
                            {s === 'UNDER_MAINTENANCE' && <AlertTriangle size={12} />}
                            {s === 'OUT_OF_SERVICE' && <AlertTriangle size={12} className="text-red-400" />}
                            {s.replace('_', ' ')}
                          </button>
                      ))}
                    </div>
                  </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div className={`${card} fade-in fade-in-delay-2`}>
                <h2 className={`font-display font-semibold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>Quick actions</h2>
                <div className="space-y-2">
                  <button onClick={() => navigate('/bookings/new', { state: { resourceId: id } })} disabled={resource.status !== 'ACTIVE'}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${resource.status === 'ACTIVE' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 glow-primary'
                              : dark ? 'bg-[#1e1e35] text-gray-600 cursor-not-allowed' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}>
                    <Calendar size={14} />
                    {resource.status === 'ACTIVE' ? 'Book this resource' : 'Resource unavailable'}
                  </button>
                </div>
              </div>

              {resource.tags?.length > 0 && (
                  <div className={`${card} fade-in fade-in-delay-3`}>
                    <h2 className={`font-display font-semibold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map(tag => (
                          <span key={tag} className={`text-xs px-2.5 py-1 rounded-full ${dark ? 'bg-[#1e1e35] text-gray-400 border border-[#2a2a45]' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                      #{tag}
                    </span>
                      ))}
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
  )
}