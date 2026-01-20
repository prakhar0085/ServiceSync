const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');

// Apply Auth Middleware to all routes
router.use(authenticateJWT);

// Create: Customer Only
router.post('/', authorizeRole(['customer']), bookingController.createBooking);

// Read: All roles (but controller filters data based on role)
router.get('/', bookingController.getBookings);

// Assign: Provider (Accept) or Admin (Force Assign)
router.patch('/:id/assign', authorizeRole(['provider', 'admin']), bookingController.assignProvider);

// Update Status: All roles (logic handled in controller)
router.patch('/:id/status', bookingController.updateStatus);

// Delete: Admin Only
router.delete('/:id', authorizeRole(['admin']), bookingController.deleteBooking);

module.exports = router;
