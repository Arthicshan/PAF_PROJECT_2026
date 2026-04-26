import api from './axiosInstance'

export const bookingApi = {
  create:       (data) => api.post('/api/v1/bookings', data),
  getMyBookings: ()    => api.get('/api/v1/bookings/my'),
  getById:      (id)   => api.get(`/api/v1/bookings/${id}`),
  getAll:       (params) => api.get('/api/v1/bookings', { params }),
  approve:      (id)   => api.put(`/api/v1/bookings/${id}/approve`),
  reject:       (id, reason) => api.put(`/api/v1/bookings/${id}/reject`, { reason }),
  cancel:       (id, reason) => api.put(`/api/v1/bookings/${id}/cancel`, { reason }),
  delete:       (id)   => api.delete(`/api/v1/bookings/${id}`),
}
