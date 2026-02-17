import { z } from 'zod';

export const DeleteTask = z.object({
  id: z.uuid()
})

export const CreateTask = z.object({
  title: z.string().trim().min(1),
  category: z.string().trim().min(1),
  city: z.string().trim().min(1),
  description: z.string().trim().min(1),
  pay: z.number().min(10),
});