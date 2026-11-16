import aiMatchService from '../services/aiMatchService.js';

export const listAIMatches = async (req, res, next) => {
  try {
    const { page, limit, status, minScore, search } = req.query;
    const data = await aiMatchService.getAIMatches({ page, limit, status, minScore, search });
    res.status(200).json({
      success: true,
      message: 'AI Matches retrieved successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewAIMatch = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { action, notes } = req.body;
    const data = await aiMatchService.reviewAIMatch(matchId, { action, notes }, req.user);
    res.status(200).json({
      success: true,
      message: `AI Match candidate marked as ${action}.`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  listAIMatches,
  reviewAIMatch,
};
