import api from '../../../services/api';

export const aiMatchService = {
  async getUserMatches() {
    return await api.get('/ai-matches/me');
  },

  async dismissMatch(matchId) {
    return await api.patch(`/ai-matches/${matchId}/dismiss`);
  },
};
