const express = require('express');

const {
  createBloodRequest,
  getEligibleBloodRequests,
  getReceivedDonations,
  getBloodRequests,
  updateBloodRequestStatus,
  deleteBloodRequest,
  getUserBloodRequest
} = require('../controllers/requestController');

const protectedRoute = require('../middlewares/AuthMiddleware');

const router = express.Router();

//  Create a new blood request
router.post('/create', protectedRoute, createBloodRequest);

//  Get all blood requests
router.get('/', getBloodRequests);

//  Update request status
router.patch('/:id/status', updateBloodRequestStatus);

//  Get eligible blood requests
router.get('/eligible', protectedRoute, getEligibleBloodRequests);

// Delete request
router.delete('/:id', deleteBloodRequest);

//  Get user-specific requests
router.get('/user', protectedRoute, getUserBloodRequest);

//  Get received donations
router.get('/donations-received', protectedRoute, getReceivedDonations);

//  EXPORT
module.exports = router;
