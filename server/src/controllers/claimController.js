import { claimService } from '../services/claimService.js';

export const claimController = {
  async submitClaim(req, res, next) {
    try {
      const claim = await claimService.submitClaim(
        req.params.itemId,
        req.user._id,
        req.body
      );
      res.status(201).json({
        success: true,
        message: 'Ownership claim submitted successfully',
        data: claim,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserClaims(req, res, next) {
    try {
      const result = await claimService.getUserClaims(req.user._id);
      res.status(200).json({
        success: true,
        message: 'User claims retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getClaimById(req, res, next) {
    try {
      const claim = await claimService.getClaimById(req.params.claimId, req.user._id);
      res.status(200).json({
        success: true,
        message: 'Claim dossier retrieved successfully',
        data: claim,
      });
    } catch (error) {
      next(error);
    }
  },

  async withdrawClaim(req, res, next) {
    try {
      const claim = await claimService.withdrawClaim(req.params.claimId, req.user._id);
      res.status(200).json({
        success: true,
        message: 'Claim withdrawn successfully',
        data: claim,
      });
    } catch (error) {
      next(error);
    }
  },
};
