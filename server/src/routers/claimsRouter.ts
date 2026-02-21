import express, { Request, Response, Router } from 'express';
import { GetClaimsParams, GetClaimParms, CreateClaimBody, CreateClaimParams } from '../services/schemas';
import { prismaClient } from '../services/prisma';

export const claimsRouter = express.Router({ mergeParams: true });

claimsRouter.get(
  "/:claimId",
  async (req: Request, res: Response) => {
    try {
      const parsedParams = GetClaimParms.safeParse(req.params);

      if (!parsedParams.success) {
        return res.status(400).json(parsedParams.error.flatten());
      }

      const { taskId, claimId } = parsedParams.data;

      const claim = await prismaClient.claim.findUnique({
        where: {
          id: claimId,
          taskId
        },
      });

      if(!claim) {
        return res.sendStatus(404);
      }

      return res.status(200).json({ claim });
    } catch (error: any) {
      console.log(error);
      res.sendStatus(500);
    }
  },
);

claimsRouter.get(
  "/",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const parsedParams = GetClaimsParams.safeParse(req.params);

      if (!parsedParams.success) {
        return res.status(400).json(parsedParams.error.flatten());
      }

      const { taskId } = parsedParams.data;

      const claims = await prismaClient.claim.findMany({
        where: {
          taskId,
        },
      });

      return res.status(200).json({ claims });
    } catch (error: any) {
      console.log(error);

      if (error?.code === "P2025") {
        return res.sendStatus(404);
      }

      res.sendStatus(500);
    }
  },
);

claimsRouter.post(
  "/:claims",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const parsedParams = CreateClaimParams.safeParse(req.params);
      const parsedBody = CreateClaimBody.safeParse(req.body);

      if (!parsedParams.success) {
        console.log("invalid params");
        return res.status(400).json(parsedParams.error.flatten());
      }

      if (!parsedBody.success) {
        console.log("ivalid body");
        return res.status(400).json(parsedBody.error.flatten());
      }

      const { taskId } = parsedParams.data;
      const { claimerName, claimerEmail } = parsedBody.data;

      await prismaClient.claim.create({
        data: {
          claimerEmail,
          claimerName,
          taskId,
        },
      });

      res.sendStatus(201);
    } catch (error: any) {
      console.log(error);

      if (error?.code === "P2025") {
        return res.sendStatus(404);
      }

      res.sendStatus(500);
    }
  },
);