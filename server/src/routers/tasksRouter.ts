// TODO: Require passwords for POST, PUT, PATCH, and DELETE requests

import express, { Router, Request, Response } from "express";
import {
  DeleteTaskParams,
  CreateTaskBody,
  PatchTaskBody,
  PatchTaskParams,
  GetAllTasks,
  GetTask,
  UpdateTaskBody,
  UpdateTaskParams,
  DeleteTaskBody,
} from "../schemas/tasksSchema";
import { prismaClient } from "../services/prisma";
import { claimsRouter } from "./claimsRouter";
import { hashPassword, verifyPassword } from "../services/bcryptUtils";

export const tasksRouter = express.Router();

tasksRouter.use("/:taskId/claims", claimsRouter);

tasksRouter.get("/", async (req: Request, res: Response) => {
  try {
    const parsedQuery = GetAllTasks.safeParse(req.query);

    if (!parsedQuery.success) {
      return res.status(400).json(parsedQuery.error.flatten());
    }

    const { includeClaims } = parsedQuery.data;

    const tasks = await prismaClient.task.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        pay: true,
        claims: includeClaims
          ? {
              select: {
                id: true,
                taskId: true,
                claimerName: true,
                claimerEmail: true,
                createdAt: true,
                // also don’t select claim.password if that’s sensitive
              },
            }
          : false,
      },
    });
    return res.status(200).json({ tasks });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

tasksRouter.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const parsed = GetTask.safeParse({ ...req.params, ...req.query });
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }
    const { id, includeClaims } = parsed.data;

    const task = await prismaClient.task.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        pay: true,
        claims: includeClaims
          ? {
              select: {
                id: true,
                taskId: true,
                claimerName: true,
                claimerEmail: true,
                createdAt: true,
                // also don’t select claim.password if that’s sensitive
              },
            }
          : false,
      },
    });
    if (!task) {
      return res.sendStatus(404);
    }
    return res.json({ task });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

tasksRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const parsedParams = DeleteTaskParams.safeParse(req.params);
    const parsedBody = DeleteTaskBody.safeParse(req.body);

    if (!parsedParams.success) {
      return res.status(400).json(parsedParams.error.flatten());
    }

    if (!parsedBody.success) {
      return res.status(400).json(parsedBody.error.flatten());
    }

    const { id } = parsedParams.data;
    const { password } = parsedBody.data;

    const deleted = await prismaClient.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id },
        select: { password: true },
      });

      if (!task) return { status: 404 as const };

      const ok = await verifyPassword(password, task.password);
      if (!ok) return { status: 401 as const };

      await tx.task.delete({ where: { id } });
      return { status: 204 as const };
    });

    return res.sendStatus(deleted.status);
  } catch (error: any) {
    console.log(error);
    return res.sendStatus(500);
  }
});

tasksRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = CreateTaskBody.safeParse(req.body);

    if (!parsed.success) return res.status(400).json(parsed.error.flatten());

    const { confirmPassword, ...data } = parsed.data;
    const hashedPassword = await hashPassword(data.password);

    const task = await prismaClient.task.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ id: task.id });
  } catch (error: any) {
    console.log(error);
    return res.sendStatus(500);
  }
});

tasksRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const parsedParams = PatchTaskParams.safeParse(req.params);
    const parsedBody = PatchTaskBody.safeParse(req.body);

    if (!parsedParams.success) {
      return res.status(400).json(parsedParams.error.flatten());
    }
    if (!parsedBody.success) {
      return res.status(400).json(parsedBody.error.flatten());
    }

    const { id } = parsedParams.data;

    const task = await prismaClient.task.update({
      where: {
        id,
      },
      data: {
        ...parsedBody.data,
      },
    });

    return res.status(200).json({ task });
  } catch (error: any) {
    console.log(error);
    if (error?.code === "P2025") {
      return res.sendStatus(404);
    }

    res.sendStatus(500);
  }
});

tasksRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const parsedBody = UpdateTaskBody.safeParse(req.body);
    const parsedParams = UpdateTaskParams.safeParse(req.params);

    if (!parsedParams.success) {
      return res.status(400).json(parsedParams.error.flatten());
    }

    if (!parsedBody.success) {
      return res.status(400).json(parsedBody.error.flatten());
    }

    const { id } = parsedParams.data;
    const { newPassword } = parsedBody.data;

    const updated = await prismaClient.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id },
        select: { password: true },
      });

      if (!task) return { status: 404 as const };

      const ok = await verifyPassword(newPassword, task.password);
      if (!ok) return { status: 401 as const };

      await tx.task.delete({ where: { id } });
      return { status: 204 as const };
    });
    return res.sendStatus(updated.status);
  } catch (error) {
    console.log(error);
    if (error.code === "P2025") {
      return res.sendStatus(404);
    }

    res.sendStatus(500);
  }
});
