import { useNavigate } from "react-router-dom"
import { AlertTriangle, Monitor, Wrench } from "lucide-react"

export default function TicketCard({ ticket }) {
    const navigate = useNavigate()

    if (!ticket) return null

    const getIcon = () => {
        if (ticket.category === "EQUIPMENT") return <Monitor size={18} />
        if (ticket.category === "MAINTENANCE") return <Wrench size={18} />
        return <AlertTriangle size={18} />
    }

    const statusStyle = {
        OPEN: "bg-blue-500/10 text-blue-500",
        IN_PROGRESS: "bg-yellow-500/10 text-yellow-500",
        RESOLVED: "bg-green-500/10 text-green-500",
        CLOSED: "bg-gray-500/10 text-gray-500",
        REJECTED: "bg-red-500/10 text-red-500"
    }

    const priorityStyle = {
        HIGH: "text-red-500",
        MEDIUM: "text-yellow-500",
        LOW: "text-green-500"
    }

    return (
        <div
            onClick={() => navigate(`/tickets/${ticket.id}`)}
            className="
            cursor-pointer rounded-2xl p-5 transition

            bg-white text-gray-900 border border-gray-200 hover:shadow-md

            dark:bg-gradient-to-br dark:from-[#1a1a2e] dark:to-[#16162a]
            dark:text-white dark:border-[#2a2a45]
            "
        >

            {/* TOP */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    {getIcon()}
                    <span className="text-xs font-semibold tracking-wide">
                        {ticket.category || "GENERAL"}
                    </span>
                </div>

                <span className={`
                    text-[10px] px-2 py-1 rounded-full font-medium
                    ${statusStyle[ticket.status] || "bg-gray-200 text-gray-600"}
                `}>
                    {ticket.status}
                </span>
            </div>

            {/* TITLE */}
            <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">
                {ticket.title}
            </h3>

            {/* DESCRIPTION */}
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {ticket.description}
            </p>

            {/* BOTTOM */}
            <div className="flex justify-between items-center mt-4 text-xs">
                <span className="text-gray-400 dark:text-gray-500">
                    📍 {ticket.location || "No location"}
                </span>

                <span className={`font-medium ${priorityStyle[ticket.priority] || ""}`}>
                    {ticket.priority}
                </span>
            </div>
        </div>
    )
}