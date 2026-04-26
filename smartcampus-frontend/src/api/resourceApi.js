import api from './axiosInstance'

export const resourceApi = {
  getAll:            (params) => api.get('/api/v1/resources', { params }),
  getById:           (id) => api.get(`/api/v1/resources/${id}`),
  getByType:         (type) => api.get(`/api/v1/resources/type/${type}`),
  getByStatus:       (status) => api.get(`/api/v1/resources/status/${status}`),
  filterResources:   (type, status, params) => api.get('/api/v1/resources/filter', { params: { type, status, ...params } }),
  search:            (q, location) => {
    if (q) return api.get('/api/v1/resources/search', { params: { q } })
    return api.get('/api/v1/resources/search', { params: { location } })
  },
  getPaged:          (params) => api.get('/api/v1/resources/paged', { params }),
  getAvailability:   (id, from, to) => api.get(`/api/v1/resources/${id}/availability`, { params: { from, to } }),
  getAnalytics:      (id) => api.get(`/api/v1/resources/${id}/analytics`),
  create:            (data) => api.post('/api/v1/resources', data),
  update:            (id, data) => api.put(`/api/v1/resources/${id}`, data),
  updateStatus:      (id, status) => api.patch(`/api/v1/resources/${id}/status`, { status }),
  delete:            (id) => api.delete(`/api/v1/resources/${id}`),
  addReview:         (id, data) => api.post(`/api/v1/resources/${id}/reviews`, data),
  getRecommendations:(data) => api.post('/api/v1/resources/ai/recommend', data),
}