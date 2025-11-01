import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../models/userSchema.js";

dotenv.config();

let otpStore = {};

export const sendVerificationCode = async (req, res) => {
  console.log("sendVerificationCode called with body:", req.body);

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;
    console.log(`✅ OTP for ${email}: ${otp}`);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "tanmayshukla252@gmail.com",
        pass: "pnsf eebx hmzw xeex",
      },
    });

    const mailOptions = {
      from: "tanmayshukla252@gmail.com",
      to: email,
      subject: "Verify Your VibeHub Email 💌",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9fafb; padding: 25px; border-radius: 10px; border: 1px solid #e5e7eb; color: #333;">
    <h2 style="color:#374151; text-align:center;">✨ Verify Your VibeHub Email ✨</h2>

    <p style="font-size: 15px; line-height: 1.6; margin-top: 15px;">
      Hey there! 👋 <br />
      Thank you for joining <strong>VibeHub</strong>. Before you start vibing with the community, please verify your email address.
    </p>

    <div style="text-align: center; background-color: #eef2ff; padding: 15px; margin: 20px 0; border-radius: 8px;">
      <p style="margin: 0; font-size: 14px;">Your one-time verification code is:</p>
      <h1 style="color: #6C63FF; letter-spacing: 3px; margin: 10px 0;">${otp}</h1>
      <p style="font-size: 13px; color: #555;">This code will expire in <strong>5 minutes</strong>.</p>
    </div>

    <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
      If you didn’t request this email, you can safely ignore it — your account will remain secure. 💫
    </p>

    <p style="text-align:center; font-size: 13px; color: #666;">
      With love,<br />
      <strong>Team VibeHub 💖</strong>
    </p>
  </div>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully:", info.response);
      res.status(200).json({ message: "Verification code sent successfully" });
    } catch (sendError) {
      console.error("❌ Failed to send email:", sendError);
      res.status(500).json({
        message: "Failed to send verification code",
        error: sendError.message,
      });
    }
  } catch (error) {
    console.error("❌ Error sending verification code:", error);
    res.status(500).json({ message: "Failed to send verification code" });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const storedOtp = otpStore[email];
    if (!storedOtp) {
      return res
        .status(400)
        .json({ message: "No OTP found for this email or OTP expired" });
    }

    if (parseInt(code) !== storedOtp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    await User.findOneAndUpdate({ email }, { isVerified: true });

    delete otpStore[email];

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("❌ Error verifying code:", error);
    res.status(500).json({ message: "Error verifying code" });
  }
};
