import { z } from 'zod';

export const createLiveSessionSchema = {
  body: z.object({
    courseCode: z.string().min(1, 'Course code is required'),
    title: z.string().min(2, 'Live session title is required'),
    description: z.string().optional(),
    startTime: z.string().datetime('Invalid start time ISO format'),
    endTime: z.string().datetime('Invalid end time ISO format'),
    meetingLink: z.string().url('Invalid meeting URL').optional().or(z.literal('')),
    recordingUrl: z.string().url('Invalid recording URL').optional().or(z.literal('')),
  }),
};
