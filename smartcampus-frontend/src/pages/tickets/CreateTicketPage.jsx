import { useState } from "react";
import Layout from "../../components/layout/Layout";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export default function CreateTicketPage() {
    const navigate = useNavigate();
    const { dark } = useTheme();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "EQUIPMENT",
        priority: "HIGH",
        location: "",
        contactDetails: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submit = async () => {
        if (!form.title.trim() || !form.description.trim()) {
            return toast.error("Title & description required");
        }

        if (!/^0\d{9}$/.test(form.contactDetails)) {
            return toast.error("Invalid phone number");
        }

        try {
            setLoading(true);

            await api.post("/api/v1/tickets", form);

            toast.success("Ticket created!");
            navigate("/tickets");

        } catch (err) {
            toast.error("Failed to create ticket");
        } finally {
            setLoading(false);
        }
    };

    const input = `
        w-full px-4 py-2 rounded-xl border outline-none text-sm
        ${dark
        ? "bg-[#16162a] border-[#2a2a45] text-white"
        : "bg-white border-gray-200 text-gray-900"}
    `;

    return (
        <Layout title="Create Ticket" subtitle="Report a new issue">
            <div className="max-w-3xl mx-auto mt-6">
                <div className={`p-6 rounded-2xl border space-y-6
                    ${dark ? "bg-[#16162a] border-[#2a2a45]" : "bg-white border-gray-200 shadow-sm"}
                `}>

                    <input name="title" placeholder="Title" className={input} onChange={handleChange} />

                    <textarea name="description" rows={4} className={input} onChange={handleChange} />

                    <div className="grid md:grid-cols-2 gap-4">
                        <input name="location" placeholder="Location" className={input} onChange={handleChange} />
                        <input name="contactDetails" placeholder="Contact" className={input} onChange={handleChange} />

                        <select name="category" className={input} onChange={handleChange}>
                            <option>EQUIPMENT</option>
                            <option>FACILITY</option>
                            <option>NETWORK</option>
                        </select>

                        <select name="priority" className={input} onChange={handleChange}>
                            <option>HIGH</option>
                            <option>MEDIUM</option>
                            <option>LOW</option>
                        </select>
                    </div>

                    <button
                        onClick={submit}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-indigo-600 text-white"
                    >
                        {loading ? "Creating..." : "Create Ticket"}
                    </button>

                </div>
            </div>
        </Layout>
    );
}