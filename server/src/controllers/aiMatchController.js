import { aiMatchService } from '../services/aiMatchService.js';

export const aiMatchController = {
  async getUserMatches(req, res, next) {
    try {
      const result = await aiMatchService.getUserMatches(req.user._id);
      res.status(200).json({
        success: true,
        message: 'AI match candidates retrieved',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async dismissMatch(req, res, next) {
    try {
      const match = await aiMatchService.dismissMatch(req.params.matchId, req.user._id);
      res.status(200).json({
        success: true,
        message: 'Match dismissed successfully',
        data: match,
      });
    } catch (error) {
      next(error);
    }
  },
};
