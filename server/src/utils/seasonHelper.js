const Season = require('../models/Season');
const mongoose = require('mongoose');

/**
 * Resolves a season ID. If given ID is valid, returns it.
 * Otherwise, finds the active season, or the latest season,
 * or auto-creates a default active season so user workflows are never blocked.
 */
async function resolveOrCreateSeason(seasonId) {
  if (seasonId && mongoose.Types.ObjectId.isValid(seasonId)) {
    return seasonId;
  }

  const activeSeason = (await Season.findOne({ status: 'Active' })) || (await Season.findOne().sort({ startDate: -1 }));
  if (activeSeason) {
    return activeSeason._id;
  }

  // Create a default active season
  const now = new Date();
  const sixMonthsLater = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
  const defaultSeason = await Season.create({
    name: 'Kharif ' + now.getFullYear(),
    status: 'Active',
    startDate: now,
    endDate: sixMonthsLater,
    notes: 'Default Active Crop Season',
  });

  return defaultSeason._id;
}

module.exports = { resolveOrCreateSeason };
