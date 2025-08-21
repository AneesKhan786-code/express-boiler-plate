import { asyncWrapper } from "@/lib/fn-wrapper";
import { HttpError } from "@/lib/fn-error";
import {
  issueResetOtp,
  verifyResetOtp,
  assertResetVerified,
  clearResetVerified,
} from "../services/passwordReset.service";
import { updateUserPasswordById, changeUserPassword } from "../services/user.service";

/**
 * Forgot Password -> Send OTP
 */
export const forgotPassword = asyncWrapper(async (req, res, next) => {
  const { email } = req.body ?? {};
  if (!email) return next(new HttpError("Email is required", 400));

  await issueResetOtp(email);

  return res.status(200).json({
    message: "OTP sent to your email. Verify to proceed.",
  });
});

/**
 * Verify OTP
 */
export const verifyResetOtpController = asyncWrapper(async (req, res, next) => {
  const { email, otp } = req.body ?? {};
  if (!email || !otp) return next(new HttpError("Email and OTP are required", 400));

  await verifyResetOtp(email, otp);

  return res.status(200).json({
    message: "OTP verified. You can now reset your password.",
  });
});

/**
 * Reset password after OTP verified
 */
export const resetPassword = asyncWrapper(async (req, res, next) => {
  const { email, newPassword } = req.body ?? {};
  if (!email || !newPassword) {
    return next(new HttpError("Email and newPassword are required", 400));
  }

  const { userId } = await assertResetVerified(email);

  // ✅ userId will always be string (uuid)
  await updateUserPasswordById(userId, newPassword);

  await clearResetVerified(email);

  return res.status(200).json({
    message: "Password reset successful.",
  });
});

/**
 * Change Password (for logged-in users)
 */
export const changePassword = asyncWrapper(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body ?? {};
  if (!oldPassword || !newPassword) {
    return next(new HttpError("Old password and new password are required", 400));
  }

  // 👇 JWT protect middleware required
  const userId = String(req.user?.id); // ✅ force convert number → string
  if (!userId) return next(new HttpError("Unauthorized", 401));

  await changeUserPassword(userId, oldPassword, newPassword);

  return res.status(200).json({
    message: "Password changed successfully.",
  });
});
