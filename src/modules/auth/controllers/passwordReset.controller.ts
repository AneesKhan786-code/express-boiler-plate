import { asyncWrapper } from "@/lib/fn-wrapper";
import { HttpError } from "@/lib/fn-error";
import {
  issueResetOtp,
  verifyResetOtp,
  assertResetVerified,
  clearResetVerified,
} from "../services/passwordReset.service";
import { updateUserPasswordById } from "../services/user.service";

export const forgotPassword = asyncWrapper(async (req, res, next) => {
  const { email } = req.body ?? {};
  if (!email) return next(new HttpError("Email is required", 400));

  await issueResetOtp(email);

  return res.status(200).json({
    message: "OTP sent to your email. Verify to proceed.",
  });
});

export const verifyResetOtpController = asyncWrapper(async (req, res, next) => {
  const { email, otp } = req.body ?? {};
  if (!email || !otp) return next(new HttpError("Email and OTP are required", 400));

  await verifyResetOtp(email, otp);

  return res.status(200).json({
    message: "OTP verified. You can now reset your password.",
  });
});

export const resetPassword = asyncWrapper(async (req, res, next) => {
  const { email, newPassword } = req.body ?? {};
  if (!email || !newPassword) return next(new HttpError("Email and newPassword are required", 400));

  const { userId } = await assertResetVerified(email);

  await updateUserPasswordById(userId, newPassword);

  await clearResetVerified(email);

  return res.status(200).json({
    message: "Password reset successful.",
  });
});
