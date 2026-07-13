import api from './api';

const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data; // { user, token }
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data.data;
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data.data;
  },

  updateMe: async (payload) => {
    const { data } = await api.put('/auth/me', payload);
    return data.data;
  },
};

export default authService;
