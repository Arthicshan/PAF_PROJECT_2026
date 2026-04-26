import { useEffect, useState } from "react"
import Layout from "../../components/layout/Layout"
import api from "../../api/axiosInstance"
import { useNavigate } from "react-router-dom"
import { Plus, Search } from "lucide-react"
import TicketCard from "../../components/tickets/TicketCard"
import SkeletonCard from "../../components/common/SkeletonCard"
import toast from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"

export default function TicketsPage() {

    const [tickets, setTickets] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)

    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")

    const navigate = useNavigate()
    const { user } = useAuth()

    useEffect(() => {
        fetchTickets()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [tickets, search, statusFilter])

    const fetchTickets = async () => {
        try {
            let res

            if (user?.role === "ADMIN" || user?.role === "TECHNICIAN") {
                res = await api.get("/api/v1/tickets")
            } else {
                res = await api.get("/api/v1/tickets/my")
            }

            setTickets(res.data || [])

        } catch (err) {
            console.error(err)
            toast.error("Failed to load tickets")
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let data = [...tickets]

        // SEARCH
        if (search.trim()) {
            const s = search.toLowerCase()
            data = data.filter(t =>
                (t.title || "").toLowerCase().includes(s) ||
                (t.description || "").toLowerCase().includes(s)
            )
        }

        // STATUS FILTER
        if (statusFilter !== "ALL") {
            data = data.filter(t => t.status === statusFilter)
        }

        setFiltered(data)
    }

    return (
        <Layout title="Tickets" subtitle="Manage incidents and track issues">

            <div className="max-w-6xl mx-auto space-y-6">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    {/* SEARCH */}
                    <div className="
                        flex items-center gap-2 px-4 py-2 rounded-xl border w-full md:w-96
                        bg-white border-gray-200 text-gray-900
                        dark:bg-[#16162a] dark:border-[#2a2a45] dark:text-white
                    ">
                        <Search size={16} className="text-gray-400" />

                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent outline-none text-sm w-full"
                        />
                    </div>

                    {/* BUTTON */}
                    <button
                        onClick={() => navigate("/tickets/new")}
                        className="
                            flex items-center gap-2 px-5 py-2 rounded-xl
                            bg-gradient-to-r from-indigo-500 to-purple-600
                            text-white text-sm font-medium hover:opacity-90
                        "
                    >
                        <Plus size={16} />
                        New Ticket
                    </button>
                </div>

                {/* FILTERS */}
                <div className="flex flex-wrap gap-2">
                    {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED", "CLOSED"].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`
                                px-3 py-1 rounded-full text-xs font-medium border transition
                                ${statusFilter === s
                                ? "bg-indigo-500 text-white border-indigo-500"
                                : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-[#16162a] dark:text-gray-400 dark:border-[#2a2a45]"
                            }
                            `}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* CONTENT */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        No matching tickets found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filtered.map(t => (
                            <TicketCard key={t.id} ticket={t} />
                        ))}
                    </div>
                )}

            </div>
        </Layout>
    )
}