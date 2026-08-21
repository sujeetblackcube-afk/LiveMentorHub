import { z } from 'zod';

export const createPayoutSchema = {
  body: z.object({
    teacherId: z.string().min(1, 'Teacher ID is required'),
    amount: z.number().positive('Payout amount must be positive'),
    paymentMethod: z.enum(['BANK_TRANSFER', 'UPI', 'CASHFREE', 'OTHER']).optional(),
    remarks: z.string().optional(),
  }),
};

export const updatePayoutStatusSchema = {
  params: z.object({
    id: z.string().or(z.number()),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED']),
    transactionReference: z.string().optional(),
    remarks: z.string().optional(),
  }),
};
