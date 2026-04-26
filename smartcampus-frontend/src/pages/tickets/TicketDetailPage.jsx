import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Layout from "../../components/layout/Layout"
import api from "../../api/axiosInstance"
import CommentSection from "../../components/tickets/CommentSection"
import AttachmentSection from "../../components/tickets/AttachmentSection"
import StatusActions from "../../components/tickets/StatusActions"
import AssignTechnician from "../../components/tickets/AssignTechnician"
import { Monitor, AlertTriangle, Wrench, MapPin } from "lucide-react"
import toast from "react-hot-toast"

export default function TicketDetailPage() {

    const { id } = useParams()
    const [ticket, setTicket] = useState(null)

    useEffect(() => {
        load()
    }, [id])

    const load = async () => {
        try {
            const res = await api.get(`/api/v1/tickets/${id}`)
            setTicket(res.data)
        } catch {
            toast.error("Failed to load ticket")
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "OPEN":
                return "bg-blue-500/20 text-blue-400"
            case "IN_PROGRESS":
                return "bg-yellow-500/20 text-yellow-400"
            case "RESOLVED":
                return "bg-green-500/20 text-green-400"
            case "CLOSED":
                return "bg-gray-500/20 text-gray-400"
            case "REJECTED":
                return "bg-red-500/20 text-red-400"
            default:
                return "bg-gray-500/20 text-gray-400"
        }
    }


    const getIcon = () => {
        if (ticket?.category === "EQUIPMENT") return <Monitor />
        if (ticket?.category === "MAINTENANCE") return <Wrench />
        return <AlertTriangle />
    }

    if (!ticket) return null

    return (
        <Layout title="Ticket Details" subtitle={ticket.title}>

            <div className="max-w-6xl mx-auto space-y-6">

                {/* ================= TOP CARD ================= */}
                <div className="
                    p-6 rounded-2xl border
                    bg-white text-gray-900 border-gray-200
                    dark:bg-[#16162a] dark:text-white dark:border-[#2a2a45]
                ">
                    <div className="flex justify-between">

                        <div className="flex gap-4">
                            <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-500/20">
                                {getIcon()}
                            </div>

                            <div>
                                <h2 className="font-semibold">{ticket.title}</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {ticket.description}
                                </p>

                                <div className="flex gap-2 text-xs mt-2 text-gray-500">
                                    <MapPin size={14}/>
                                    {ticket.location}
                                </div>
                            </div>
                        </div>

                        <span
                            className={`text-xs px-3 py-1 rounded-full font-medium self-start
                            ${getStatusColor(ticket.status)}
                          `}
                        >
                          {ticket.status}
                        </span>

                    </div>
                </div>

                {/* ================= GRID ================= */}
                <div className="grid md:grid-cols-3 gap-6 items-stretch">

                    {/* LEFT SIDE */}
                    <div className="md:col-span-2 flex flex-col h-full">

                        <div className="
                            flex-1 p-5 rounded-2xl border
                            bg-white text-gray-900 border-gray-200
                            dark:bg-[#16162a] dark:text-white dark:border-[#2a2a45]
                        ">
                            <CommentSection ticketId={ticket.id} />
                        </div>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex flex-col gap-6 h-full">

                        {/* ACTIONS */}
                        <div className="
                            p-5 rounded-2xl border
                            bg-white text-gray-900 border-gray-200
                            dark:bg-[#16162a] dark:text-white dark:border-[#2a2a45]
                        ">
                            <StatusActions ticket={ticket} refresh={load}/>
                        </div>

                        {/* ASSIGN TECH */}
                        <div className="
                            p-5 rounded-2xl border
                            bg-white text-gray-900 border-gray-200
                            dark:bg-[#16162a] dark:text-white dark:border-[#2a2a45]
                        ">
                            <AssignTechnician ticketId={ticket.id} refresh={load}/>
                        </div>

                        {/* ATTACHMENTS (MOVED HERE) */}
                        <div className="
                            flex-1 p-5 rounded-2xl border
                            bg-white text-gray-900 border-gray-200
                            dark:bg-[#16162a] dark:text-white dark:border-[#2a2a45]
                        ">
                            <AttachmentSection ticketId={ticket.id} />
                        </div>

                    </div>

                </div>
            </div>

        </Layout>
    )
}