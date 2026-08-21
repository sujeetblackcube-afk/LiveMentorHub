import { z } from 'zod';

export const studentLoginSchema = {
  body: z.object({
    identifier: z.string().min(1, 'Email or mobile is required').optional(),
    email: z.string().email('Invalid email').optional(),
    mobile: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    playerId: z.string().optional(),
    deviceType: z.enum(['android', 'ios', 'web']).optional(),
  }),
};

export const studentSignupSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
    parentName: z.string().min(2, 'Parent name is required'),
    parentEmail: z.string().email('Invalid parent email'),
    parentMobile: z.string().min(10, 'Parent mobile is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    country: z.string().optional(),
    address: z.string().optional(),
  }),
};

export const studentForgotPasswordSchema = {
  body: z.object({
    identifier: z.string().min(1, 'Email or mobile is required'),
  }),
};

export const studentResetPasswordSchema = {
  body: z.object({
    identifier: z.string().min(1, 'Email or mobile is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
};

export const studentVerifyOtpSchema = {
  body: z.object({
    identifier: z.string().optional(),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  }),
};

export const studentSendOtpSchema = {
  body: z.object({
    identifier: z.string().min(1, 'Email or mobile is required'),
  }),
};
