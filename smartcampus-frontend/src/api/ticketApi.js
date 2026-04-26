import axios from "./axiosInstance";

// ================= TICKETS =================
export const getMyTickets = () => axios.get("/api/v1/tickets/my");
export const getAllTickets = () => axios.get("/api/v1/tickets");
export const getTicketById = (id) => axios.get(`/api/v1/tickets/${id}`);
export const createTicket = (data) => axios.post("/api/v1/tickets", data);
export const deleteTicket = (id) => axios.delete(`/api/v1/tickets/${id}`);

// ================= STATUS =================
export const updateStatus = (id, data) =>
    axios.patch(`/api/v1/tickets/${id}/status`, data);

export const assignTechnician = (id, data) =>
    axios.patch(`/api/v1/tickets/${id}/assign`, data);

// ================= COMMENTS =================
export const getComments = (ticketId) =>
    axios.get(`/api/v1/tickets/${ticketId}/comments`);

export const addComment = (ticketId, data) =>
    axios.post(`/api/v1/tickets/${ticketId}/comments`, data);

export const deleteComment = (id) =>
    axios.delete(`/api/v1/tickets/comments/${id}`);

// ================= ATTACHMENTS =================
export const uploadAttachment = (ticketId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axios.post(`/api/v1/tickets/${ticketId}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const getAttachments = (ticketId) =>
    axios.get(`/api/v1/tickets/${ticketId}/attachments`);

export const deleteAttachment = (id) =>
    axios.delete(`/api/v1/tickets/attachments/${id}`);

export const assignTechnician = (id, technicianId) =>
    axios.patch(`/tickets/${id}/assign`, { technicianId });