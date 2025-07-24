export const generateOtp = (): string => Math.floor(100000 + Math.random() * 900000).toString();

export const generateOtpExpiry = (): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  return now;
};
