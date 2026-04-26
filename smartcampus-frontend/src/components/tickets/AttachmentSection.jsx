import { useState, useEffect } from "react"
import api from "../../api/axiosInstance"
import toast from "react-hot-toast"
import { Upload, Paperclip } from "lucide-react"

export default function AttachmentSection({ ticketId }) {

    const [files, setFiles] = useState([])
    const [list, setList] = useState([])

    const load = async () => {
        try {
            const res = await api.get(`/api/v1/tickets/${ticketId}/attachments`)
            setList(res.data || [])
        } catch (err) {
            console.error(err)
            toast.error("Failed to load attachments")
        }
    }

    useEffect(() => {
        if (ticketId) load()
    }, [ticketId])

    const upload = async () => {
        if (files.length === 0) return toast.error("Select file")

        try {
            for (let file of files) {
                const form = new FormData()
                form.append("file", file)

                await api.post(`/api/v1/tickets/${ticketId}/attachments`, form, {
                    headers: { "Content-Type": "multipart/form-data" }
                })
            }

            toast.success("Uploaded successfully")
            setFiles([])
            load()

        } catch (err) {
            console.error(err.response?.data)
            toast.error(err.response?.data?.message || "Upload failed")
        }
    }

    return (
        <div>
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">
                Attachments
            </h3>

            {/* LIST */}
            <div className="space-y-2 mb-4">
                {list.length === 0 ? (
                    <p className="text-xs text-gray-400">No attachments yet</p>
                ) : (
                    list.map(a => (
                        <div key={a.id}
                             className="flex items-center justify-between gap-2 text-sm px-3 py-2 rounded-lg
                             bg-gray-100 border border-gray-200 text-gray-800
                             dark:bg-[#1e1e35] dark:border-[#2a2a45] dark:text-white">

                            <div className="flex items-center gap-2">
                                <Paperclip size={14} />
                                {a.fileName}
                            </div>

                            {/* DOWNLOAD */}
                            <a
                                href={`http://localhost:8080/api/v1/tickets/attachments/${a.id}/download`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-indigo-500 hover:underline"
                            >
                                Download
                            </a>
                        </div>
                    ))
                )}
            </div>

            {/* UPLOAD */}
            <div className="mt-4 flex flex-col gap-2">

                <input
                    type="file"
                    multiple
                    onChange={e => setFiles([...e.target.files])}
                    className="text-sm w-full"
                />

                <button
                    onClick={upload}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm"
                >
                    <Upload size={16} />
                    Upload
                </button>

            </div>
        </div>
    )
}