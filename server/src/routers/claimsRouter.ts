import express, { Request, Response, Router } from "express";
import {
  GetClaimParms,
  CreateClaimBody,
  UpdateClaimBody,
  CreateClaimParams,
  GetClaimsParams,
  UpdateClaimParams,
  DeleteClaimParams,
} from "../schemas/claimsSchemas";
import { prismaClient } from "../services/prisma";
import { parse } from "dotenv";

export const claimsRouter = express.Router({ mergeParams: true });

// TODO: PUT, PATCH routes

claimsRouter.put("/:claimId", async (req: Request, res: Response) => {
  try {
    const parsedParams = UpdateClaimParams.safeParse(req.params);
    const parsedBody = UpdateClaimBody.safeParse(req.body);

    if (!parsedParams.success) {
      return res.status(400).json(parsedParams.error.flatten());
    }

    if (!parsedBody.success) {
      return res.status(400).json(parsedBody.error.flatten());
    }

    const { taskId, claimId } = parsedParams.data;

    await prismaClient.claim.update({
      where: {
        id: claimId,
        taskId,
      },
      data: {
        ...parsedBody.data,
      },
    });
  } catch (error: any) {
    console.log(error);

    if (error?.code === "P2025") {
      return res.sendStatus(404);
    }

    res.sendStatus(500);
  }
});

claimsRouter.delete("/:claimId", async (req: Request, res: Response) => {
  try {
    const parsedParams = DeleteClaimParams.safeParse(req.params);

    if (!parsedParams.success) {
      return res.status(400).json(parsedParams.error.flatten());
    }

    const { claimId } = parsedParams.data;

    await prismaClient.claim.delete({
      where: {
        id: claimId,
      },
    });

    res.sendStatus(200);
  } catch (error: any) {
    console.log(error);
    if (error?.code === "P2025") {
      res.sendStatus(404);
    }
  }
});

claimsRouter.get("/:claimId", async (req: Request, res: Response) => {
  try {
    const parsedParams = GetClaimParms.safeParse(req.params);

    if (!parsedParams.success) {
      return res.status(400).json(parsedParams.error.flatten());
    }

    const { taskId, claimId } = parsedParams.data;

    const claim = await prismaClient.claim.findUnique({
      where: {
        id: claimId,
        taskId,
      },
    });

    if (!claim) {
      return res.sendStatus(404);
    }

    return res.status(200).json({ claim });
  } catch (error: any) {
    console.log(error);
    res.sendStatus(500);
  }
});

claimsRouter.get("/", async (req: Request, res: Response) => {
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
});

claimsRouter.post(
  "/:claims",
  async (req: Request, res: Response) => {
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

      // 
      // await prismaClient.claim.create({
      //   data: {
      //     claimerEmail,
      //     claimerName,
      //     taskId,
      //   },
      // });

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
