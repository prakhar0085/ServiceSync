const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceType: { type: String, required: true },
  date: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In-progress', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  history: [
    {
      action: String, // 'created', 'assigned', 'rejected', etc.
      timestamp: { type: Date, default: Date.now },
      user: String, // 'customer', 'provider-ID', 'admin', 'system'
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
