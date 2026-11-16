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
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Season name is required (सीजन का नाम आवश्यक है)' });
    }

    const sDate = startDate ? new Date(startDate) : new Date();
    const eDate = endDate ? new Date(endDate) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

    const season = await Season.create({
      name: name.trim(),
      startDate: sDate,
      endDate: eDate,
      status: status || 'Active',
      notes: notes ? notes.trim() : undefined,
    });
    res.status(201).json({ success: true, message: 'Season created successfully', season });
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
