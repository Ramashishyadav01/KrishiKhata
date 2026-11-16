const Machine = require('../models/Machine');

const DEFAULT_MACHINES = [
  { nameEn: 'Tractor', nameHi: 'ट्रैक्टर', billingUnit: 'Hour', defaultRate: 1000, status: 'Active' },
  { nameEn: 'Rotavator', nameHi: 'रोटावेटर', billingUnit: 'Bigha', defaultRate: 2000, status: 'Active' },
  { nameEn: '9 Harrah (Cultivator)', nameHi: '9 हर्रा (कल्टीवेटर)', billingUnit: 'Bigha', defaultRate: 1500, status: 'Active' },
  { nameEn: 'TY', nameHi: 'टी.वाई.', billingUnit: 'Bigha', defaultRate: 1600, status: 'Active' },
  { nameEn: 'Dhan Thresher', nameHi: 'धान थ्रेशर', billingUnit: 'Hour', defaultRate: 1200, status: 'Active' },
  { nameEn: 'Gehu Thresher', nameHi: 'गेहूँ थ्रेशर', billingUnit: 'Hour', defaultRate: 1100, status: 'Active' },
  { nameEn: 'Trolley', nameHi: 'ट्रॉली', billingUnit: 'Trip', defaultRate: 800, status: 'Active' },
  { nameEn: 'Palewa', nameHi: 'पलेवा', billingUnit: 'Hour', defaultRate: 800, status: 'Active' },
  { nameEn: 'Combine Harvester', nameHi: 'कम्बाइन हार्वेस्टर', billingUnit: 'Bigha', defaultRate: 2500, status: 'Active' },
  { nameEn: 'Laser Leveler', nameHi: 'लेजर लेवलर', billingUnit: 'Hour', defaultRate: 1500, status: 'Active' },
  { nameEn: 'Rice Mill', nameHi: 'राइस मिल', billingUnit: 'Quintal', defaultRate: 250, status: 'Active' },
  { nameEn: 'Bran', nameHi: 'चोकर', billingUnit: 'Quintal', defaultRate: 2500, status: 'Active' },
];

exports.getMachines = async (req, res, next) => {
  try {
    let machines = await Machine.find().sort({ createdAt: 1 });
    // If no machines exist, automatically populate default farm machines
    if (machines.length === 0) {
      machines = await Machine.insertMany(DEFAULT_MACHINES);
    }
    res.json({ success: true, count: machines.length, machines });
  } catch (error) {
    next(error);
  }
};

exports.seedDefaultMachines = async (req, res, next) => {
  try {
    for (const dm of DEFAULT_MACHINES) {
      await Machine.findOneAndUpdate(
        { nameEn: dm.nameEn },
        { $setOnInsert: dm },
        { upsert: true, new: true }
      );
    }
    const machines = await Machine.find().sort({ createdAt: 1 });
    res.json({
      success: true,
      message: 'Standard farm machines populated successfully (मानक कृषि मशीनें सफलतापूर्वक जोड़ी गईं)',
      count: machines.length,
      machines,
    });
  } catch (error) {
    next(error);
  }
};

exports.createMachine = async (req, res, next) => {
  try {
    const { nameEn, nameHi, billingUnit, defaultRate, status, notes } = req.body;

    if (!nameEn || !nameEn.trim()) {
      return res.status(400).json({ success: false, message: 'Machine name (English) is required' });
    }

    const machine = await Machine.create({
      nameEn: nameEn.trim(),
      nameHi: (nameHi && nameHi.trim()) || nameEn.trim(),
      billingUnit: billingUnit || 'Bigha',
      defaultRate: parseFloat(defaultRate) || 0,
      status: status || 'Active',
      notes: notes ? notes.trim() : undefined,
    });

    res.status(201).json({ success: true, message: 'Machine added successfully', machine });
  } catch (error) {
    next(error);
  }
};

exports.updateMachine = async (req, res, next) => {
  try {
    if (req.body.defaultRate !== undefined) {
      const numRate = Number(req.body.defaultRate);
      if (isNaN(numRate) || numRate < 0) {
        return res.status(400).json({ success: false, message: 'Default rate must be a valid non-negative number' });
      }
    }
    const machine = await Machine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!machine) return res.status(404).json({ success: false, message: 'Machine / Service not found' });
    res.json({ success: true, message: 'Machine updated successfully', machine });
  } catch (error) {
    next(error);
  }
};

exports.deleteMachine = async (req, res, next) => {
  try {
    await Machine.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Machine deleted successfully' });
  } catch (error) {
    next(error);
  }
};
