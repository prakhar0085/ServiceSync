const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bookingRoutes = require('./routes/bookingRoutes');
const startScheduler = require('./utils/scheduler');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB Connected');
    // Start Background Jobs only after DB connection
    startScheduler();
})
.catch(err => console.error('MongoDB Connection Error:', err));

const authRoutes = require('./routes/authRoutes');

const userRoutes = require('./routes/userRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
