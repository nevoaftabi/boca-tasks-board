import { z } from "zod";

export const DeleteTaskParams = z.object({
  id: z.uuid(),
});

export const DeleteTaskBody = z
  .object({
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const GetAllTasks = z.object({
  includeClaims: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export const GetTask = z.object({
  id: z.uuid(),
  includeClaims: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export const CreateTaskBody = z
  .object({
    title: z.string().trim().min(1),
    category: z.string().trim().min(1),
    city: z.string().trim().min(1),
    description: z.string().trim().min(1),
    pay: z.number().min(10),
    password: z.string().trim().min(5),
    confirmPassword: z.string().trim().min(5),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const UpdateTaskBody = z
  .object({
    title: z.string().trim().min(1),
    category: z.string().trim().min(1),
    city: z.string().trim().min(1),
    description: z.string().trim().min(1),
    pay: z.number().min(10),
    newPassword: z.string().trim().min(5).optional(),
    confirmPassword: z.string().trim().min(5).optional(),
  })
  .refine(
    (data) =>
      data.newPassword ? data.newPassword === data.confirmPassword : true,
    { path: ["confirmPassword"], error: "Passwords do not match" },
  );

export const UpdateTaskParams = z.object({
  id: z.uuid(),
});

export const PatchTaskBody = z
  .object({
    title: z.string().trim().min(1).optional(),
    subject: z.string().trim().min(1).optional(),
    city: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    pay: z.number().min(10),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    error: "Body must include at least one field to update",
  });

export const PatchTaskParams = z.object({
  id: z.uuid(),
});
