import { useEffect, useState } from "react"
import api from "../../api/axiosInstance"
import toast from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"

export default function AssignTechnician({ ticketId, refresh }) {

    const { user } = useAuth()
    const [techs, setTechs] = useState([])
    const [selected, setSelected] = useState("")
    const [loading, setLoading] = useState(false)

    if (user?.role !== "ADMIN") return null

    const loadTechs = async () => {
        try {
            const res = await api.get("/api/v1/users/technicians")

            setTechs(res.data?.data || [])

        } catch (err) {
            console.error(err)
            toast.error("Failed to load technicians")
        }
    }

    useEffect(() => {
        loadTechs()
    }, [])

    const assign = async () => {

        if (!selected) {
            return toast.error("Select technician")
        }

        try {
            setLoading(true)

            await api.patch(`/api/v1/tickets/${ticketId}/assign`, {
                technicianId: selected
            })

            toast.success("Technician assigned successfully")

            setSelected("")
            refresh && refresh()

        } catch (err) {
            console.error(err)
            toast.error(err.response?.data?.message || "Failed to assign")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">
                Assign Technician
            </h3>

            <div className="flex gap-2">

                <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm border
                        bg-white text-gray-700 border-gray-300
                        dark:bg-[#16162a] dark:border-[#2a2a45] dark:text-white"
                >
                    <option value="">Select technician</option>

                    {techs.map(t => (
                        <option key={t.id} value={t.id}>
                            {t.name || t.email}
                        </option>
                    ))}

                </select>

                <button
                    onClick={assign}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm"
                >
                    {loading ? "Assigning..." : "Assign"}
                </button>

            </div>
        </div>
    )
}