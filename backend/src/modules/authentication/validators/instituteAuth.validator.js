import { z } from 'zod';

export const instituteLoginSchema = {
  body: z.object({
    identifier: z.string().min(1, 'Email or mobile is required').optional(),
    email: z.string().email('Invalid email').optional(),
    mobile: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    playerId: z.string().optional(),
    deviceType: z.enum(['android', 'ios', 'web']).optional(),
  }),
};

export const instituteSignupSchema = {
  body: z.object({
    name: z.string().min(2, 'Institute name is required'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    country: z.string().optional(),
    address: z.string().optional(),
  }),
};

export const instituteForgotPasswordSchema = {
  body: z.object({
    identifier: z.string().min(1, 'Email or mobile is required'),
  }),
};

export const instituteResetPasswordSchema = {
  body: z.object({
    identifier: z.string().min(1, 'Email or mobile is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
};

export const instituteVerifyOtpSchema = {
  body: z.object({
    identifier: z.string().optional(),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  }),
};

export const instituteSendOtpSchema = {
  body: z.object({
    identifier: z.string().min(1, 'Email or mobile is required'),
  }),
};
