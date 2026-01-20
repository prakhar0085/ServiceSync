const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Prevent creating admin via public signup, purely for safety in this demo
    if (role === 'admin') {
        return res.status(403).json({ error: 'Cannot register as admin directly.' });
    }

    const user = new User({ name, email, password, role });
    await user.save();
    
    // Generate Token
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Seed Admin Helper (Optional endpoint to create first admin)
exports.seedAdmin = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const exists = await User.findOne({ email: email || 'admin@servicesync.com' });
        if(exists) return res.json({ message: 'Admin already exists' });

        const admin = new User({
            name: name || 'System Admin',
            email: email || 'admin@servicesync.com',
            password: password || 'admin123',
            role: 'admin'
        });
        await admin.save();
        res.json({ message: 'Admin seeded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
