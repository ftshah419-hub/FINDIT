import { AIMatch } from '../models/AIMatch.js';
import { Item } from '../models/Item.js';
import { Notification } from '../models/Notification.js';
import { NOTIFICATION_TYPES, ITEM_STATUS, ITEM_TYPES } from '../constants/index.js';

export const aiMatchService = {
  calculateScore(lostItem, foundItem) {
    let score = 0;
    const features = [];

    // 1. Category check (35 points)
    if (lostItem.categoryId.toString() === foundItem.categoryId.toString()) {
      score += 35;
      features.push('Category Match 100%');
    }

    // 2. Title & Keywords overlap (up to 35 points)
    const lostTokens = (lostItem.title + ' ' + (lostItem.description || '') + ' ' + (lostItem.distinctiveFeatures || ''))
      .toLowerCase()
      .split(/[\s,\-_/]+/)
      .filter((w) => w.length > 2);

    const foundTokens = (foundItem.title + ' ' + (foundItem.description || '') + ' ' + (foundItem.distinctiveFeatures || ''))
      .toLowerCase()
      .split(/[\s,\-_/]+/)
      .filter((w) => w.length > 2);

    const lostSet = new Set(lostTokens);
    let matchedWords = 0;
    foundTokens.forEach((t) => {
      if (lostSet.has(t)) matchedWords++;
    });

    if (lostTokens.length > 0) {
      const tokenRatio = Math.min(matchedWords / Math.min(lostTokens.length, 6), 1);
      const tokenScore = Math.round(tokenRatio * 35);
      score += tokenScore;
      if (tokenScore > 15) {
        features.push(`Keyword & Descriptor Overlap ${Math.min(98, Math.round(tokenRatio * 100))}%`);
      }
    }

    // 3. Brand Matching (up to 15 points)
    if (lostItem.brand && foundItem.brand) {
      if (lostItem.brand.toLowerCase() === foundItem.brand.toLowerCase()) {
        score += 15;
        features.push('Brand & Model Verification 98%');
      }
    } else if (lostItem.brand && foundItem.title.toLowerCase().includes(lostItem.brand.toLowerCase())) {
      score += 12;
      features.push('Brand Match 90%');
    }

    // 4. Location Proximity (up to 15 points)
    const lostLoc = (lostItem.location?.name || '').toLowerCase();
    const foundLoc = (foundItem.location?.name || '').toLowerCase();
    const lostZone = (lostItem.location?.campusZone || '').toLowerCase();
    const foundZone = (foundItem.location?.campusZone || '').toLowerCase();

    if (lostZone && foundZone && lostZone === foundZone) {
      score += 10;
      features.push('Campus Zone Proximity 90%');
      if (lostLoc && foundLoc && (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc))) {
        score += 5;
        features.push('Specific Facility Anchor Match');
      }
    } else if (lostLoc && foundLoc && (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc))) {
      score += 12;
      features.push('Location Match 85%');
    }

    return {
      score: Math.min(100, Math.max(score, 0)),
      features: features.length > 0 ? features : ['General Visual & Descriptor Alignment'],
    };
  },

  async scanAndGenerateMatches(item) {
    try {
      if (item.type === ITEM_TYPES.LOST) {
        // Compare against approved FOUND items
        const foundItems = await Item.find({
          type: ITEM_TYPES.FOUND,
          status: { $in: [ITEM_STATUS.APPROVED, ITEM_STATUS.PENDING] },
        });

        for (const found of foundItems) {
          const { score, features } = this.calculateScore(item, found);
          if (score >= 60) {
            const match = await AIMatch.findOneAndUpdate(
              { lostItemId: item._id, foundItemId: found._id },
              {
                similarityScore: score,
                confidence: score,
                matchingFeatures: features,
                status: 'PENDING',
              },
              { upsert: true, new: true }
            );

            // Send notification to lost item reporter if high confidence
            if (score >= 80) {
              await Notification.create({
                recipientId: item.reportedBy,
                title: 'High-Confidence AI Smart Match Identified',
                message: `FINDIT AI Radar found a ${score}% match between your reported '${item.title}' and new Found Item #${found._id.toString().slice(-4).toUpperCase()}.`,
                type: NOTIFICATION_TYPES.AI_MATCH_FOUND,
                relatedItemId: found._id,
              });
            }
          }
        }
      } else if (item.type === ITEM_TYPES.FOUND) {
        // Compare against active LOST items
        const lostItems = await Item.find({
          type: ITEM_TYPES.LOST,
          status: { $in: [ITEM_STATUS.APPROVED, ITEM_STATUS.PENDING] },
        });

        for (const lost of lostItems) {
          const { score, features } = this.calculateScore(lost, item);
          if (score >= 60) {
            await AIMatch.findOneAndUpdate(
              { lostItemId: lost._id, foundItemId: item._id },
              {
                similarityScore: score,
                confidence: score,
                matchingFeatures: features,
                status: 'PENDING',
              },
              { upsert: true, new: true }
            );

            if (score >= 80) {
              await Notification.create({
                recipientId: lost.reportedBy,
                title: 'High-Confidence AI Smart Match Identified',
                message: `FINDIT AI Radar detected a ${score}% match for your '${lost.title}' with recently turned-in property.`,
                type: NOTIFICATION_TYPES.AI_MATCH_FOUND,
                relatedItemId: item._id,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating AI matches:', error);
    }
  },

  async getUserMatches(userId) {
    // Get all lost items reported by user
    const userLostItems = await Item.find({
      reportedBy: userId,
      type: ITEM_TYPES.LOST,
    }).select('_id title itemDate location images status brand');

    const lostItemIds = userLostItems.map((i) => i._id);

    const matches = await AIMatch.find({
      lostItemId: { $in: lostItemIds },
      status: { $ne: 'DISMISSED' },
    })
      .populate({
        path: 'lostItemId',
        populate: { path: 'categoryId', select: 'name' },
      })
      .populate({
        path: 'foundItemId',
        populate: { path: 'categoryId', select: 'name' },
      })
      .sort({ similarityScore: -1 });

    return {
      userLostItems,
      matches,
    };
  },

  async dismissMatch(matchId, userId) {
    const match = await AIMatch.findById(matchId).populate('lostItemId');
    if (!match) {
      throw new Error('AI match record not found');
    }
    if (match.lostItemId.reportedBy.toString() !== userId.toString()) {
      throw new Error('You do not have permission to dismiss this match');
    }
    match.status = 'DISMISSED';
    await match.save();
    return match;
  },
};
