import { z } from 'zod';

export const CreateClaimBody = z.object({
  claimerName: z.string().trim().min(1),
  claimerEmail: z.email(),
});

export const CreateClaimParams = z.object({
  taskId: z.uuid(),
});

export const GetClaimsParams = z.object({
  taskId: z.uuid(),
});

export const GetClaimParms = z.object({
  taskId: z.uuid(),
  claimId: z.uuid(),
});

export const UpdateClaimParams = z.object({
  taskId: z.uuid(),
  claimId: z.uuid()
});

export const UpdateClaimBody = z.object({
  claimerName: z.string().trim().min(1),
  claimerEmail: z.email(),
});

export const DeleteClaimParams = z.object({
  claimId: z.uuid(),
});

export const DeleteClaimBody = z.object({
  password: z.string()
})