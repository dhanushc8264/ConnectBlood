const express = require('express');

const {
  getUserDonations,
  updateDonationStatus,
  sendDonationRequest
} = require('../controllers/donationController');

const ProtectedRoute = require('../middlewares/AuthMiddleware');

const router = express.Router();

//  Donation request
router.post('/request', ProtectedRoute, sendDonationRequest);

//  Get donation history
router.get('/', ProtectedRoute, getUserDonations);

// Update donation status
router.put('/update/:donationId', ProtectedRoute, updateDonationStatus);

//  EXPORT
module.exports = router;
