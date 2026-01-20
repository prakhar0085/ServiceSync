const Booking = require('../models/Booking');

// Simulate "Provider fails to accept in 5 minutes" check every 30 seconds
const startScheduler = () => {
    console.log('Background Scheduler Started...');
    setInterval(async () => {
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const staleBookings = await Booking.find({ 
                status: 'Pending', 
                createdAt: { $lt: fiveMinutesAgo }
            });

            for (const booking of staleBookings) {
                const lastEvent = booking.history[booking.history.length - 1];
                if (lastEvent && lastEvent.action !== 'timeout_check') {
                    console.log(`[Auto-Reassign] Booking ${booking._id} timed out.`);
                    booking.history.push({ action: 'timeout_check', user: 'system' });
                    await booking.save();
                }
            }
        } catch (err) {
            console.error('Background Job Error:', err);
        }
    }, 30000); 
};

module.exports = startScheduler;
