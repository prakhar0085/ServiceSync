const Booking = require('../models/Booking');

// 1. Create a Booking (Customer Only)
exports.createBooking = async (req, res) => {
  try {
    const { serviceType, date } = req.body;
    const newBooking = new Booking({
      customer: req.user.id, // From JWT
      serviceType,
      date,
      history: [{ action: 'created', user: 'customer' }]
    });
    await newBooking.save();
    
    // Populate customer details for response
    await newBooking.populate('customer', 'name email');
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Fetch all bookings (Filtered by Role)
exports.getBookings = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'customer') {
        query.customer = req.user.id;
    } else if (req.user.role === 'provider') {
        // Providers see:
        // 1. Jobs explicitly assigned to them
        // 2. "Pending" jobs that are unassigned (Available Pool)
        query = {
            $or: [
                { provider: req.user.id },
                { status: 'Pending', provider: null }
            ]
        };
    }
    // Admin sees all (empty query)

    const bookings = await Booking.find(query)
        .sort({ createdAt: -1 })
        .populate('customer', 'name email')
        .populate('provider', 'name email');
        
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Assign Provider (Provider Accepts) or Admin Assigns
exports.assignProvider = async (req, res) => {
  try {
    // If Admin, they might send providerId in body. If Provider, use their own ID.
    const providerId = req.user.role === 'admin' ? req.body.providerId : req.user.id;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.status !== 'Pending') {
      return res.status(400).json({ error: 'Booking is not Pending' });
    }

    booking.status = 'Assigned';
    booking.provider = providerId;
    booking.history.push({ action: 'assigned', user: req.user.role === 'admin' ? 'admin' : 'provider' });
    await booking.save();
    
    await booking.populate('provider', 'name');
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Update Status (Lifecycle)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body; 
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const oldStatus = booking.status;
    booking.status = status;
    
    let action = `status_change_to_${status}`;
    
    if (status === 'Pending' && oldStatus === 'Assigned') {
        // Rejection or Retry
        booking.provider = null;
        action = 'rejected_by_provider';
    } else if (status === 'Cancelled') {
        action = `cancelled_by_${req.user.role}`;
    }

    booking.history.push({ action, user: req.user.role }); // 'customer', 'provider', 'admin'
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Delete Booking
exports.deleteBooking = async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
