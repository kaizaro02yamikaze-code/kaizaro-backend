// server.js - यह कोड Server पर चलेगा (Backend)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors()); // Frontend और Backend को कनेक्ट करने के लिए
app.use(bodyParser.json());

// --- TWILIO CONFIGURATION (Apna Real Account Details yahan dalein) ---
const accountSid = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Twilio Dashboard se milega
const authToken = 'your_auth_token_here';           // Twilio Dashboard se milega
const client = new twilio(accountSid, authToken);
const TWILIO_PHONE_NUMBER = '+1234567890'; // Twilio se mila hua number

// Temporary OTP Store (Real app me Database use karein)
const otpStore = {}; 

// 1. SEND OTP API
app.post('/send-otp', (req, res) => {
    const { phone } = req.body;
    
    // 6 Digit OTP Generate karein
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[phone] = otp;

    // Real SMS bhejein via Twilio
    client.messages.create({
        body: `Your Kaizaro Login OTP is: ${otp}`,
        to: `+91${phone}`,  // Indian Number Format
        from: TWILIO_PHONE_NUMBER
    })
    .then((message) => {
        console.log(`OTP sent to ${phone}: ${otp}`);
        res.json({ success: true, message: "OTP Sent Successfully via SMS!" });
    })
    .catch((error) => {
        console.error(error);
        res.json({ success: false, message: "Failed to send SMS." });
    });
});

// 2. VERIFY OTP API
app.post('/verify-otp', (req, res) => {
    const { phone, otp } = req.body;

    if (parseInt(otpStore[phone]) === parseInt(otp)) {
        delete otpStore[phone]; // OTP use hone ke baad delete karein
        res.json({ success: true, message: "Login Successful!" });
    } else {
        res.json({ success: false, message: "Invalid OTP!" });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});