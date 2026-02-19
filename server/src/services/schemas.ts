import { z } from "zod";

export const DeleteTask = z.object({
  id: z.uuid(),
});

export const GetTask = z.object({
  id: z.uuid(),
});

export const CreateTask = z.object({
  title: z.string().trim().min(1),
  category: z.string().trim().min(1),
  city: z.string().trim().min(1),
  description: z.string().trim().min(1),
  pay: z.number().min(10),
});

export const UpdateTaskBody = z.object({
  title: z.string().trim().min(1),
  category: z.string().trim().min(1),
  city: z.string().trim().min(1),
  description: z.string().trim().min(1),
  pay: z.number().min(10),
});

export const UpdateTaskParams = z.object({
  id: z.uuid(),
});

export const PatchTaskBody = z.object({
  title: z.string().trim().min(1).optional(),
  subject: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  pay: z.number().min(10),
}).refine((obj) => Object.keys(obj).length > 0, {
  error: "Body must include at least one field to update"
});

export const PatchTaskParams = z.object({
  id: z.uuid()
})