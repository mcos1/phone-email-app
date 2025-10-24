// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Validate environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('❌ Missing EMAIL_USER or EMAIL_PASSWORD in .env file');
  process.exit(1);
}

// Configure Nodemailer transporter (using Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use Gmail App Password
  },
});

// Verify transporter connection (optional, but useful during dev)
transporter.verify((error, success) => {
  if (error) {
    console.error('Error verifying email transporter:', error);
  } else {
    console.log('✅ Email transporter ready');
  }
});

// Endpoint: Send email with uploaded photo
app.post('/send-email', upload.single('photo'), async (req, res) => {
  try {
    const { email } = req.body;
    const photo = req.file;

    if (!email || !photo) {
      return res.status(400).json({ error: 'Email and photo are required' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Photo from Phone to Email App',
      text: 'Here is the photo you uploaded. You can now forward this email to anyone!',
      html: '<p>Here is the photo you uploaded. You can now forward this email to anyone!</p>',
      attachments: [
        {
          filename: photo.originalname,
          content: photo.buffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`📤 Email sent successfully to ${email}`);

    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
