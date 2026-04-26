import { useState, useEffect, useRef } from "react"
import api from "../../api/axiosInstance"
import toast from "react-hot-toast"

export default function CommentSection({ ticketId }) {

    const [comments, setComments] = useState([])
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)

    const bottomRef = useRef(null)

    const load = async () => {
        try {
            const res = await api.get(`/api/v1/tickets/${ticketId}/comments`)
            setComments(res.data || [])
        } catch (err) {
            console.error(err)
            toast.error("Failed to load comments")
        }
    }

    useEffect(() => {
        if (ticketId) load()
    }, [ticketId])

    // Auto scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [comments])


    const add = async () => {
        if (!text.trim()) return toast.error("Enter comment")

        try {
            setLoading(true)

            await api.post(`/api/v1/tickets/${ticketId}/comments`, {
                content: text
            })

            setText("")
            toast.success("Comment added")

            load()

        } catch (err) {
            console.error(err)
            toast.error(err?.response?.data?.message || "Failed to add comment")
        } finally {
            setLoading(false)
        }
    }


    const getRoleLabel = (role) => {
        if (role === "USER") return "User"
        if (role === "TECHNICIAN") return "Technician"
        if (role === "ADMIN") return "Admin"
        return "Unknown"
    }

    return (
        <div className="
            p-5 rounded-2xl border
            bg-white text-gray-900 border-gray-200
            dark:bg-[#16162a] dark:text-white dark:border-[#2a2a45]
        ">

            <h3 className="font-semibold mb-4">Comments</h3>

            {/* EMPTY */}
            {comments.length === 0 && (
                <p className="text-sm text-gray-400 mb-3">No comments yet</p>
            )}

            {/* COMMENTS */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">

                {comments.map(c => {

                    const isUser = c.authorRole === "USER"
                    const isTech = c.authorRole === "TECHNICIAN"
                    const isAdmin = c.authorRole === "ADMIN"

                    return (
                        <div
                            key={c.id}
                            className={`p-3 rounded-lg text-sm max-w-[80%]
                                ${isUser
                                ? "ml-auto bg-blue-100 text-blue-900"
                                : isTech
                                    ? "mr-auto bg-green-100 text-green-900"
                                    : "mr-auto bg-gray-200 text-gray-900"}
                                dark:bg-[#1e1e35] dark:text-white
                            `}
                        >

                            {/* HEADER */}
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-xs">
                                    {c.authorName || "Unknown"} ({getRoleLabel(c.authorRole)})
                                </span>

                                <span className="text-xs opacity-60">
                                    {new Date(c.createdAt).toLocaleString()}
                                </span>
                            </div>

                            {/* MESSAGE */}
                            <p>{c.content}</p>

                        </div>
                    )
                })}

                {/* AUTO SCROLL TARGET */}
                <div ref={bottomRef}></div>
            </div>

            {/* INPUT */}
            <div className="flex gap-2 mt-4">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write a comment..."
                    className="
                        flex-1 px-3 py-2 rounded-lg text-sm outline-none
                        bg-white border border-gray-300 text-gray-900
                        dark:bg-[#0f0f1a] dark:border-[#2a2a45] dark:text-white
                    "
                />

                <button
                    onClick={add}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
                >
                    {loading ? "Sending..." : "Send"}
                </button>
            </div>
        </div>
    )
}