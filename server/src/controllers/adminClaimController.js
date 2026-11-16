import claimService from '../services/claimService.js';

export const listClaims = async (req, res, next) => {
  try {
    const { page, limit, status, search, urgentOnly } = req.query;
    const data = await claimService.getClaims({ page, limit, status, search, urgentOnly });
    res.status(200).json({
      success: true,
      message: 'Claims retrieved successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getClaimDetails = async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const data = await claimService.getClaimById(claimId);
    res.status(200).json({
      success: true,
      message: 'Claim details retrieved successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewClaim = async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const { status, adminNote } = req.body;
    const data = await claimService.reviewClaim(claimId, { status, adminNote }, req.user);
    res.status(200).json({
      success: true,
      message: `Claim review complete: ${status}.`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  listClaims,
  getClaimDetails,
  reviewClaim,
};
