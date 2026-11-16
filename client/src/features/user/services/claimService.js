import api from '../../../services/api';

export const claimService = {
  async submitClaim(itemId, data) {
    return await api.post(`/items/${itemId}/claims`, data);
  },

  async getUserClaims() {
    return await api.get('/claims/me');
  },

  async getClaimById(claimId) {
    return await api.get(`/claims/${claimId}`);
  },

  async withdrawClaim(claimId) {
    return await api.patch(`/claims/${claimId}/withdraw`);
  },
};
