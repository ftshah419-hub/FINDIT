import api from '../../../services/api';

export const itemService = {
  async getPublicItems(params = {}) {
    return await api.get('/items', { params });
  },

  async getItemById(id) {
    return await api.get(`/items/${id}`);
  },

  async getUserReports(params = {}) {
    return await api.get('/items/me', { params });
  },

  async createReport(data) {
    return await api.post('/items', data);
  },

  async updateReport(id, data) {
    return await api.patch(`/items/${id}`, data);
  },

  async deleteReport(id) {
    return await api.delete(`/items/${id}`);
  },

  async getCategories() {
    return await api.get('/categories');
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    return await api.post('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async uploadMultipleImages(files) {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('images', f));
    return await api.post('/uploads/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
