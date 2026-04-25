import { useState, useEffect, useCallback } from 'react'
import { Plus, Grid3X3, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import ResourceCard from '../../components/resources/ResourceCard'
import FilterSidebar from '../../components/resources/FilterSidebar'
import AISearchBar from '../../components/resources/AISearchBar'
import SkeletonCard from '../../components/common/SkeletonCard'
import { resourceApi } from '../../api/resourceApi'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'

export default function ResourceCataloguePage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiResults, setAiResults] = useState(null)
  const [filters, setFilters] = useState({})
  const [showFilters, setShowFilters] = useState(true)
  const { isAdmin } = useAuth()
  const { dark } = useTheme()
  const navigate = useNavigate()

  const fetchResources = useCallback(async () => {
    setLoading(true)
    try {
      const hasType     = Boolean(filters.type)
      const hasStatus   = Boolean(filters.status)
      const hasLocation = Boolean(filters.location?.trim())

      let data = []

      // Route to the most specific backend endpoint based on active filters
      if (hasType && hasStatus) {
        // GET /api/v1/resources/filter?type=X&status=Y (paginated)
        const res = await resourceApi.filterResources(filters.type, filters.status, { page: 0, size: 100 })
        data = res.data?.data?.content || res.data?.data || []
      } else if (hasType) {
        // GET /api/v1/resources/type/{type}
        const res = await resourceApi.getByType(filters.type)
        data = res.data?.data || []
      } else if (hasStatus) {
        // GET /api/v1/resources/status/{status}
        const res = await resourceApi.getByStatus(filters.status)
        data = res.data?.data || []
      } else if (hasLocation) {
        // GET /api/v1/resources/search?location=X
        const res = await resourceApi.search(null, filters.location.trim())
        data = res.data?.data || []
      } else {
        // No filters — GET /api/v1/resources
        const res = await resourceApi.getAll()
        data = res.data?.data?.content || res.data?.data || []
      }

      // Client-side post-filtering for criteria with no dedicated backend endpoint
      if (hasLocation && (hasType || hasStatus)) {
        const q = filters.location.trim().toLowerCase()
        data = data.filter(r => r.location?.toLowerCase().includes(q))
      }
      if (filters.minCapacity) {
        data = data.filter(r => (r.capacity ?? 0) >= parseInt(filters.minCapacity))
      }
      if (filters.amenities?.length) {
        data = data.filter(r =>
            filters.amenities.every(a =>
                r.amenities?.map(x => x.toLowerCase()).includes(a.toLowerCase())
            )
        )
      }

      setResources(data)
    } catch {
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchResources() }, [fetchResources])

  const displayedResources = aiResults !== null ? aiResults : resources

  return (
      <Layout title="Facilities & Resources" subtitle="Browse and book campus facilities">
        <div className="space-y-5">

          {/* AI Search */}
          <div className="fade-in">
            <AISearchBar
                onResults={setAiResults}
                onClear={() => setAiResults(null)}
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between fade-in fade-in-delay-1">
            <div className="flex items-center gap-3">
              <button
                  onClick={() => setShowFilters(f => !f)}
                  className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                ${dark
                      ? `border ${showFilters ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400' : 'border-[#2a2a45] text-gray-400 hover:text-white'}`
                      : `border ${showFilters ? 'border-indigo-300 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`
                  }
              `}
              >
                <SlidersHorizontal size={14} />
                <span className="font-body">Filters</span>
              </button>

              <span className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              {loading ? '...' : `${displayedResources.length} ${aiResults !== null ? 'AI results' : 'resources'}`}
            </span>

              {aiResults !== null && (
                  <span className={`text-xs px-2 py-1 rounded-full ${dark ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25' : 'bg-indigo-50 text-indigo-600'}`}>
                AI Search active
              </span>
              )}
            </div>

            {isAdmin() && (
                <button
                    onClick={() => navigate('/resources/new')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all glow-primary"
                >
                  <Plus size={14} />
                  <span>Add Resource</span>
                </button>
            )}
          </div>

          {/* Content area */}
          <div className="flex gap-5">

            {/* Filter sidebar */}
            {showFilters && (
                <div className="fade-in">
                  <FilterSidebar
                      filters={filters}
                      onChange={setFilters}
                      onReset={() => setFilters({})}
                  />
                </div>
            )}

            {/* Grid */}
            <div className="flex-1">
              {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
              ) : displayedResources.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border ${dark ? 'border-[#2a2a45] bg-[#16162a]' : 'border-gray-100 bg-white'}`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${dark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                      <Grid3X3 size={24} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
                    </div>
                    <h3 className={`font-display font-semibold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
                      No resources found
                    </h3>
                    <p className={`text-sm text-center max-w-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Try adjusting your filters or use AI search to find what you need.
                    </p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {displayedResources.map((resource, i) => (
                        <div key={resource.id} className="fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                          <ResourceCard resource={resource} />
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
  )
}