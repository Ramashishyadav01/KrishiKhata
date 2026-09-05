const Season = require('../models/Season');

exports.getSeasons = async (req, res, next) => {
  try {
    const seasons = await Season.find().sort({ startDate: -1 });
    res.json({ success: true, count: seasons.length, seasons });
  } catch (error) {
    next(error);
  }
};

exports.createSeason = async (req, res, next) => {
  try {
    const { name, startDate, endDate, status, notes } = req.body;
    const season = await Season.create({ name, startDate, endDate, status, notes });
    res.status(201).json({ success: true, season });
  } catch (error) {
    next(error);
  }
};

exports.updateSeason = async (req, res, next) => {
  try {
    const season = await Season.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!season) return res.status(404).json({ success: false, message: 'Season not found' });
    res.json({ success: true, season });
  } catch (error) {
    next(error);
  }
};
