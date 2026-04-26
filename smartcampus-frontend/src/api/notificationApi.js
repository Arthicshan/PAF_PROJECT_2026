import axios from "./axiosInstance";

export const getNotifications = () =>
    axios.get("/notifications");

export const getUnreadCount = () =>
    axios.get("/notifications/unread-count");

export const markAsRead = (id) =>
    axios.patch(`/notifications/${id}/read`);

export const markAllRead = () =>
    axios.patch("/notifications/read-all");