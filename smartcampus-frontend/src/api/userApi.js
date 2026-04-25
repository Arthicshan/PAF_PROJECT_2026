import api from './axiosInstance'

export const userApi = {
  getMe: () => api.get('/api/v1/users/me'),
  getAll: () => api.get('/api/v1/users'),
  updateRole: (id, role) => api.patch(`/api/v1/users/${id}/role`, null, { params: { role } }),
}
