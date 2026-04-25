import { useState } from "react"
import api from "../../api/axiosInstance"
import toast from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"
import { Loader2 } from "lucide-react"

export default function StatusActions({ ticket, refresh }) {

    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    if (!ticket || !user) return null

    const isOwner = user.id === ticket.reportedBy
    const isAdmin = user.role === "ADMIN"
    const isTech = user.role === "TECHNICIAN"

    const updateStatus = async (status) => {

        let note = ""

        if (["REJECTED", "RESOLVED", "CLOSED"].includes(status)) {
            note = prompt(`Enter note for ${status}:`)
            if (!note) return toast.error("Note required")
        }

        try {
            setLoading(true)

            await api.patch(`/api/v1/tickets/${ticket.id}/status`, {
                status,
                resolutionNote: note
            })

            toast.success(`Ticket updated to ${status}`)
            refresh && refresh()

        } catch (err) {
            console.error(err.response?.data)
            toast.error(err.response?.data?.message || "Failed to update ticket")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">
                Actions
            </h3>

            <div className="flex flex-col gap-3">

                {/* START PROGRESS — ONLY ADMIN OR TECH */}
                {ticket.status === "OPEN" && (isAdmin || isTech) && (
                    <button
                        onClick={() => updateStatus("IN_PROGRESS")}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        Start Progress
                    </button>
                )}

                {/* RESOLVE — ONLY TECH OR ADMIN */}
                {ticket.status === "IN_PROGRESS" && (isAdmin || isTech) && (
                    <button
                        onClick={() => updateStatus("RESOLVED")}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm"
                    >
                        Mark Resolved
                    </button>
                )}

                {/* CLOSE — ONLY OWNER OR ADMIN */}
                {ticket.status === "RESOLVED" && (isOwner || isAdmin) && (
                    <button
                        onClick={() => updateStatus("CLOSED")}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-gray-600 text-white text-sm"
                    >
                        Close Ticket
                    </button>
                )}

                {/* REJECT — ONLY ADMIN */}
                {ticket.status !== "REJECTED" && isAdmin && (
                    <button
                        onClick={() => updateStatus("REJECTED")}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm"
                    >
                        Reject Ticket
                    </button>
                )}

            </div>
        </div>
    )
}