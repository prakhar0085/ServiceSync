const User = require('../models/User');

exports.getProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider' }).select('name email _id');
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
