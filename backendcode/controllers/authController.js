import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MESSAGES } from "../utils/messages.js";
import ApiError from "../utils/ApiError.js";

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const ENABLE_SMS = process.env.ENABLE_SMS === "true";
const FAST2SMS_SENDER_ID = process.env.FAST2SMS_SENDER_ID || "MYPROPT";

const otpStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt < now) otpStore.delete(phone);
  }
}, 60000);

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();
const validateIndianPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

const formatPhoneForFast2SMS = (phone) => {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) cleaned = cleaned.substring(2);
  if (cleaned.length === 10) return cleaned;
  throw new ApiError(MESSAGES.AUTH.INVALID_PHONE, 400);
};

// const sendRealTimeSMS = async (phone, otpCode) => {
//   otpStore.set(phone, { code: otpCode, expiresAt: Date.now() + 10 * 60 * 1000, createdAt: Date.now() });

//   if (!ENABLE_SMS) return { success: true };

//   const formattedPhone = formatPhoneForFast2SMS(phone);
//   const payload = {
//     sender_id: FAST2SMS_SENDER_ID,
//     message: `Your OTP is ${otpCode}. Valid for 10 minutes.`,
//     language: "english",
//     route: "otp",
//     numbers: formattedPhone,
//   };

//   const response = await axios.post("https://www.fast2sms.com/dev/bulkV2", payload, {
//     headers: { authorization: FAST2SMS_API_KEY, "Content-Type": "application/json" },
//     timeout: 10000,
//   });

//   if (!response.data.return) throw new ApiError(MESSAGES.AUTH.OTP_FAILED, 500);
//   return { success: true };
// };

const sendRealTimeSMS = async (phone, otpCode) => {
  // Store OTP in memory
  otpStore.set(phone, {
    code: otpCode,
    expiresAt: Date.now() + 10 * 60 * 1000,
    createdAt: Date.now(),
  });

  // **Log OTP in terminal for testing**
  console.log(`OTP for ${phone}: ${otpCode}`);

  if (!ENABLE_SMS) return { success: true };

  const formattedPhone = formatPhoneForFast2SMS(phone);
  const payload = {
    sender_id: FAST2SMS_SENDER_ID,
    message: `Your OTP is ${otpCode}. Valid for 10 minutes.`,
    language: "english",
    route: "otp",
    numbers: formattedPhone,
  };

  const response = await axios.post("https://www.fast2sms.com/dev/bulkV2", payload, {
    headers: { authorization: FAST2SMS_API_KEY, "Content-Type": "application/json" },
    timeout: 10000,
  });

  if (!response.data.return) throw new ApiError(MESSAGES.AUTH.OTP_FAILED, 500);
  return { success: true };
};


const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2d" });
};

export const sendOtp = asyncHandler(async (req, res) => {
  const { phone, role } = req.body;
  if (!phone || !role) throw new ApiError(MESSAGES.AUTH.PHONE_ROLE_REQUIRED, 400);
  if (!validateIndianPhone(phone)) throw new ApiError(MESSAGES.AUTH.INVALID_PHONE, 400);

  const existing = otpStore.get(phone);
  if (existing && Date.now() - existing.createdAt < 30000)
    throw new ApiError("Please wait 30 seconds before requesting again", 429);

  const otp = generateOtp();
  await sendRealTimeSMS(phone, otp);
  res.status(200).json({ success: true, message: MESSAGES.AUTH.OTP_SENT });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { phone, role } = req.body;
  if (!phone || !role) throw new ApiError(MESSAGES.AUTH.PHONE_ROLE_REQUIRED, 400);

  const otp = generateOtp();
  await sendRealTimeSMS(phone, otp);
  res.status(200).json({ success: true, message: MESSAGES.AUTH.OTP_RESENT || "OTP resent successfully" });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp, role } = req.body;
  if (!phone || !otp || !role) throw new ApiError(MESSAGES.AUTH.OTP_INVALID, 400);

  const otpData = otpStore.get(phone);
  if (!otpData) throw new ApiError(MESSAGES.AUTH.OTP_EXPIRED, 400);
  if (otpData.code !== otp) throw new ApiError(MESSAGES.AUTH.OTP_INCORRECT, 400);

  let user = await User.findOne({ phone });

  if (!user) {
    user = await User.create({ phone, role: [role] });
  } else if (!user.role.includes(role)) {
    user.role.push(role);
    await user.save();
  }

  otpStore.delete(phone);
  const accessToken = generateAccessToken(user);

  res.status(200).json({ success: true, message: MESSAGES.AUTH.LOGIN_SUCCESS, user, accessToken });
});

export const profile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-__v");
  if (!user) throw new ApiError(MESSAGES.AUTH.USER_NOT_FOUND, 404);
  res.status(200).json({ success: true, user });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(MESSAGES.AUTH.USER_NOT_FOUND, 404);
  await User.findByIdAndDelete(userId);
  res.status(200).json({ success: true, message: MESSAGES.AUTH.ACCOUNT_DELETED });
});
