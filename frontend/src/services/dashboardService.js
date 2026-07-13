import api from './api';

const dashboardService = {
  getStats: async () => {
    const { data } = await api.get('/dashboard');
    return data.data;
  },
};

export default dashboardService;
