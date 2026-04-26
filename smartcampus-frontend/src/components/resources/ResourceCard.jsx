import { useNavigate } from 'react-router-dom'
import { MapPin, Users, Wifi, Monitor, Wind, ChevronRight, Cpu } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import { useTheme } from '../../context/ThemeContext'

const typeIcons = {
  LECTURE_HALL: '🎓',
  LAB: '🔬',
  MEETING_ROOM: '💼',
  EQUIPMENT: '🔧',
}

const amenityIcons = {
  projector: <Monitor size={12} />,
  AC: <Wind size={12} />,
  whiteboard: <Monitor size={12} />,
  smart_board: <Cpu size={12} />,
  wifi: <Wifi size={12} />,
}

export default function ResourceCard({ resource }) {
  const navigate = useNavigate()
  const { dark } = useTheme()

  return (
    <div
      onClick={() => navigate(`/resources/${resource.id}`)}
      className={`
        group relative rounded-2xl overflow-hidden cursor-pointer card-hover
        ${dark
          ? 'bg-[#16162a] border border-[#2a2a45] hover:border-indigo-500/50'
          : 'bg-white border border-indigo-100 hover:border-indigo-300 shadow-sm hover:shadow-md'
        }
        transition-all duration-200
      `}
    >
      {/* Image or gradient placeholder */}
      <div className="relative h-36 overflow-hidden">
        {resource.imageUrl ? (
          <img
            src={resource.imageUrl}
            alt={resource.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            dark
              ? 'bg-gradient-to-br from-indigo-900/40 to-purple-900/40'
              : 'bg-gradient-to-br from-indigo-50 to-purple-50'
          }`}>
            <span className="text-4xl opacity-60">{typeIcons[resource.type] || '🏢'}</span>
          </div>
        )}

        {/* Type badge overlay */}
        <div className="absolute top-3 left-3">
          <span className={`
            text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg
            ${dark ? 'bg-black/50 text-indigo-300 backdrop-blur-sm' : 'bg-white/80 text-indigo-600 backdrop-blur-sm'}
          `}>
            {resource.type?.replace('_', ' ')}
          </span>
        </div>

        {/* Status overlay */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={resource.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={`font-display font-semibold text-sm leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
            {resource.name}
          </h3>
          <ChevronRight
            size={14}
            className={`flex-shrink-0 mt-0.5 transition-transform group-hover:translate-x-1 ${dark ? 'text-indigo-400' : 'text-indigo-500'}`}
          />
        </div>

        {/* Location */}
        <div className={`flex items-center gap-1.5 text-xs mb-3 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          <MapPin size={11} />
          <span className="truncate">{resource.location || 'Location not set'}</span>
        </div>

        {/* Capacity */}
        {resource.capacity && (
          <div className={`flex items-center gap-1.5 text-xs mb-3 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Users size={11} />
            <span>Up to {resource.capacity} people</span>
          </div>
        )}

        {/* AI Summary snippet */}
        {resource.aiSummary && (
          <p className={`text-xs leading-relaxed mb-3 line-clamp-2 ${dark ? 'text-gray-500' : 'text-gray-500'}`}>
            {resource.aiSummary}
          </p>
        )}

        {/* Amenities */}
        {resource.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resource.amenities.slice(0, 4).map((a) => (
              <span
                key={a}
                className={`
                  inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md
                  ${dark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}
                `}
              >
                {amenityIcons[a]}
                {a.replace('_', ' ')}
              </span>
            ))}
            {resource.amenities.length > 4 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-md ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                +{resource.amenities.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  )
}
