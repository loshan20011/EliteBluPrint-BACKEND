import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create a nodemailer transporter using your email service credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generate a random 4-digit OTP code
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP email function
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: "elitebluprint.architect@gmail.com",
      to: email,
      subject: "OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #4a7eb1;">Password Reset Request</h1>
          <p style="font-size: 16px;">We received a request to reset your password for your EliteBluPrint account.</p>
          <div style="background-color: #f8f9fa; padding: 10px; margin: 20px 0; border-radius: 5px;">
            <p style="font-size: 18px;">Your OTP code is: <strong style="font-size: 20px; color: #4a7eb1;">${otp}</strong></p>
          </div>
          <p style="font-size: 16px;">Please enter this code to proceed with resetting your password.</p>
          <hr>
          <p style="font-size: 14px;">If you did not request a password reset, please ignore this email or contact support if you have any questions.</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Controller function to handle form submission and send OTP email
const sendOtpEmail = async (req, res) => {
  try {
    // Extract the entered email from the request body
    const { email } = req.body;

    // Generate a 4-digit OTP code
    const otpCode = generateOTP();

    // Send the OTP email
    await sendOTPEmail(email, otpCode);

    // Log the email and OTP
    console.log("Entered Email:", email);
    console.log("Generated OTP:", otpCode);

    // Respond to the client (you can customize the response as needed)
    res.json({
      success: true,
      message: "OTP email sent successfully",
      generatedOtp: otpCode,
    });
  } catch (error) {
    console.error("Error handling forgot password request:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export default sendOtpEmail;
