// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Resend } = require('resend');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors({
  origin: [
    'https://phone-email-app.vercel.app',  // your deployed frontend
    'http://localhost:3000'                // for local testing
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Endpoint: Send email with uploaded photo
app.post('/send-email', upload.single('photo'), async (req, res) => {
  try {
    const { email } = req.body;
    const photo = req.file;

    if (!email || !photo) {
      return res.status(400).json({ error: 'Email and photo are required' });
    }

    console.log(`📨 Sending email via Resend to ${email}`);

    const result = await resend.emails.send({
      from: 'Photo App <onboarding@resend.dev>', // Must be a verified sender in Resend
      to: email,
      subject: 'Your Photo from Phone to Email App',
      html: '<p>Here is the photo you uploaded. You can now forward this email to anyone!</p>',
      attachments: [
        {
          filename: photo.originalname,
          content: photo.buffer.toString('base64'),
        },
      ],
    });

    console.log('✅ Email sent successfully via Resend:', result);
    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('❌ Error sending email via Resend:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
