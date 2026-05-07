const Donation = require('../models/donation');
const BloodRequest = require('../models/bloodRequest');
const User = require('../models/userModel');
const { sendSMS } = require('../utils/twilio');

// ✅ GET USER DONATIONS
const getUserDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor_id: req.user.id })
      .populate("request_id", "blood_group units_needed status")
      .sort({ donation_date: -1 });

    res.status(200).json({ donations });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// ✅ UPDATE DONATION STATUS
const updateDonationStatus = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const donation = await Donation.findByIdAndUpdate(
      donationId,
      { status },
      { new: true }
    ).populate("request_id donor_id");

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // ✅ UPDATE BLOOD REQUEST IF COMPLETED
    if (status === "completed" && donation.request_id) {
      await BloodRequest.findByIdAndUpdate(
        donation.request_id._id,
        {
          status: "fulfilled",
          fulfilled_at: new Date()
        },
        { new: true }
      );
    }

    const donorInfo = await User.findById(donation.donor_id)
      .select("name email phone");

    const requesterInfo = await User.findById(donation.request_id.requester_id)
      .select("name email phone");

    // ✅ SEND SMS
    if (status === "completed" && requesterInfo && donorInfo) {
      const smsMessage = `Donation accepted! Donor details - Name: ${donorInfo.name}, Email: ${donorInfo.email}, Phone: ${donorInfo.phone}.`;

      await sendSMS(requesterInfo.phone, smsMessage);

      const smsMessageToDonor = `Your donation request has been accepted! Requester details - Name: ${requesterInfo.name}, Email: ${requesterInfo.email}, Phone: ${requesterInfo.phone}.`;

      await sendSMS(donorInfo.phone, smsMessageToDonor);
    }

    res.status(200).json({
      message: `Donation status updated to ${status}`,
      donation,
      donorInfo,
      requesterInfo
    });

  } catch (err) {
    console.error("Error updating donation status:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ SEND DONATION REQUEST
const sendDonationRequest = async (req, res) => {
  try {
    const { request_id } = req.body;

    const bloodRequest = await BloodRequest.findById(request_id)
      .populate('requester_id', 'name email phone');

    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found" });
    }

    const existingDonation = await Donation.findOne({
      donor_id: req.user.id,
      request_id
    });

    if (existingDonation) {
      return res.status(400).json({
        message: "You have already requested to donate for this request."
      });
    }

    const newDonation = new Donation({
      donor_id: req.user.id,
      request_id,
      status: "pending"
    });

    await newDonation.save();

    const donorInfo = await User.findById(req.user.id)
      .select('name email phone blood_group');

    const populatedDonation = await Donation.findById(newDonation._id)
      .populate('donor_id', 'name email phone blood_group')
      .populate('request_id');

    res.status(201).json({
      success: true,
      message: "Donation request sent successfully.",
      donation: populatedDonation,
      donorInfo,
      requestInfo: bloodRequest
    });

  } catch (err) {
    console.error("Error sending donation request:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

// ✅ EXPORT ALL FUNCTIONS
module.exports = {
  getUserDonations,
  updateDonationStatus,
  sendDonationRequest
};
