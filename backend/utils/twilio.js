const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ✅ SEND SMS
const sendSMS = async (to, message) => {
  try {
    // ✅ Skip real SMS in test environment
    if (process.env.NODE_ENV === 'test') {
      console.log("Mock SMS sent:", { to, message });
      return { sid: "mock_sid" };
    }

    let formattedTo = to;

    if (!formattedTo.startsWith('+')) {
      formattedTo = '+91' + formattedTo;
    }

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedTo
    });

    console.log("SMS sent successfully:", response.sid);
    return response;

  } catch (err) {
    console.error("Error sending SMS:", err);
    throw err;
  }
};

// ✅ EXPORT
module.exports = {
  sendSMS
};
