import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const resetPassword = async (req, res, next) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    transporter.sendMail(
      {
        from: process.env.EMAIL_ADDRESS, // sender address
        to: email, // send to user's email address
        subject: "Password Reset Successful",
        text: "Your password has been successfully reset.", // plain text body
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #4a7eb1;">Password Reset Successful</h1>
          <p style="font-size: 16px;">Hello,</p>
          <p style="font-size: 16px;">Your password has been <strong style="color: #4a7eb1;">successfully reset</strong>. You can now log in to your account using your new password.</p>
          <div style="background-color: #f8f9fa; padding: 10px; margin: 20px 0; border-radius: 5px;">
            <p style="font-size: 16px;">If you did not request this change, please contact our support immediately.</p>
          </div>
          <p style="font-size: 16px;">Best,</p>
          <p style="font-size: 16px;">Your EliteBluPrint Team</p>
        </div>
      `, // html body
      },
      (error, info) => {
        if (error) {
          console.log("Error sending email", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      }
    );

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await User.updateOne({ email }, { password: hashedPassword });

    res.status(200).send({
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};
