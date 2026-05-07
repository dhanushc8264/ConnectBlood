const Donation = require('../models/donation');
const BloodRequest = require('../models/bloodRequest');
const User = require('../models/userModel');
const { io, connectedDonors } = require('../server');
const { getDistanceFromLatLonInKm } = require('../utils/distance');

// ✅ CREATE BLOOD REQUEST
const createBloodRequest = async (req, res) => {
  try {
    const {
      blood_group,
      units_needed,
      hospital,
      location,
      urgency_level,
      latitude,
      longitude
    } = req.body;

    if (!blood_group || !units_needed || !hospital || !location || !urgency_level) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const requester_id = req.user.id;

    const bloodRequest = new BloodRequest({
      requester_id,
      blood_group,
      units_needed,
      hospital,
      location,
      urgency_level,
      latitude,
      longitude
    });

    await bloodRequest.save();

    // ✅ Notify matching donors
    connectedDonors.forEach((donor, socketId) => {
      if (donor.blood_group === bloodRequest.blood_group) {
        io.to(socketId).emit('newbloodrequest', bloodRequest);
      }
    });

    res.status(201).json({
      message: "Blood request created successfully",
      bloodRequest
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ GET ALL REQUESTS
const getBloodRequests = async (req, res) => {
  try {
    const bloodRequests = await BloodRequest.find().sort({ createdAt: -1 });

    res.status(200).json(bloodRequests);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ UPDATE STATUS
const updateBloodRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "fulfilled", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (status === "fulfilled") {
      const bloodRequest = await BloodRequest.findById(id);

      if (!bloodRequest) {
        return res.status(404).json({ message: "Blood request not found" });
      }

      bloodRequest.status = "fulfilled";
      bloodRequest.fulfilled_at = new Date();

      await bloodRequest.save();

      return res.status(200).json({
        message: "Blood request fulfilled successfully",
        bloodRequest
      });
    }

    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Blood request not found" });
    }

    res.status(200).json(updatedRequest);

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ DELETE REQUEST
const deleteBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const bloodRequest = await BloodRequest.findById(id);

    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found" });
    }

    await BloodRequest.findByIdAndDelete(id);

    res.status(200).json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ GET ELIGIBLE REQUESTS
const getEligibleBloodRequests = async (req, res) => {
  try {
    const donor = await User.findById(req.user.id)
      .select("blood_group location");

    if (!donor) {
      return res.status(404).json({ message: "User not found" });
    }

    let eligibleRequests = await BloodRequest.find({
      blood_group: donor.blood_group,
      status: "pending"
    }).sort({ createdAt: -1 });

    const sortByLocation = req.query.sortByLocation === "true";

    if (
      sortByLocation &&
      donor.location?.latitude &&
      donor.location?.longitude
    ) {
      eligibleRequests = eligibleRequests.map((req) => {
        if (!req.latitude || !req.longitude) {
          return { ...req.toObject(), distance: 999999 };
        }

        const distance = getDistanceFromLatLonInKm(
          donor.location.latitude,
          donor.location.longitude,
          req.latitude,
          req.longitude
        );

        return { ...req.toObject(), distance };
      });

      eligibleRequests.sort((a, b) => a.distance - b.distance);
    }

    res.status(200).json({
      requests: eligibleRequests
    });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ USER REQUESTS
const getUserBloodRequest = async (req, res) => {
  try {
    const bloodRequests = await BloodRequest.find({
      requester_id: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json(bloodRequests || []);

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ RECEIVED DONATIONS
const getReceivedDonations = async (req, res) => {
  try {
    const userRequests = await BloodRequest.find({
      requester_id: req.user.id
    }).select("_id");

    if (!userRequests.length) {
      return res.status(200).json({ donations: [] });
    }

    const ids = userRequests.map(req => req._id);

    const donations = await Donation.find({
      request_id: { $in: ids }
    })
      .populate("donor_id", "name email")
      .populate("request_id", "blood_group units_needed status");

    res.status(200).json({ donations });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ EXPORT ALL FUNCTIONS
module.exports = {
  createBloodRequest,
  getBloodRequests,
  updateBloodRequestStatus,
  deleteBloodRequest,
  getEligibleBloodRequests,
  getUserBloodRequest,
  getReceivedDonations
};
