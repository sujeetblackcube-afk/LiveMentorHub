import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().optional(),
    email: z.string().optional(),
    mobile: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
    role: z.string().optional(),
    forceLogout: z.boolean().optional(),
    playerId: z.string().nullable().optional(),
    deviceType: z.string().nullable().optional(),
  }).refine((data) => data.identifier || data.email || data.mobile, {
    message: 'Identifier (email or mobile) is required',
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['student', 'teacher', 'parent', 'superadmin']).optional(),
  }),
});

export const sendOtpSchema = z.object({
  body: z.object({
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits').optional(),
    email: z.string().email('Invalid email address').optional(),
  }).refine((data) => data.mobile || data.email, {
    message: 'Either mobile or email is required',
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits').optional(),
    email: z.string().email('Invalid email address').optional(),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  }),
});

export const courseSchema = z.object({
  body: z.object({
    courseName: z.string().min(3, 'Course name must be at least 3 characters'),
    courseType: z.string().optional(),
    courseDescription: z.string().optional(),
    mrp: z.union([z.string(), z.number()]).optional(),
    discountedprice: z.union([z.string(), z.number()]).optional(),
  }),
});
