import express from 'express';
import sendOtpEmail  from '../controllers/forgotPasswordController.js';

const router = express.Router();

// Handle the form submission and send OTP email
router.post('/submit', sendOtpEmail);

export default router;