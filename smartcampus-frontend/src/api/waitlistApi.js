import api from './axiosInstance'

export const waitlistApi = {
  join:         (data)    => api.post('/api/v1/waitlist', data),
  getMyWaitlist: ()       => api.get('/api/v1/waitlist/my'),
  getActiveCount: ()      => api.get('/api/v1/waitlist/my/count'),
  getById:      (id)      => api.get(`/api/v1/waitlist/${id}`),
  getAll:       (params)  => api.get('/api/v1/waitlist', { params }),
  remove:       (id)      => api.delete(`/api/v1/waitlist/${id}`),
  confirm:      (id)      => api.put(`/api/v1/waitlist/${id}/confirm`),
}
