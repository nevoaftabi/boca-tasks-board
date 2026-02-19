import express, { Router, Request, Response } from 'express';
import {
  DeleteTask,
  CreateTask,
  GetTask,
  UpdateTaskParams,
  UpdateTaskBody,
  PatchTaskBody,
  PatchTaskParams,
} from "../services/schemas";
import { prismaClient } from "../services/prisma";

export const taskRouter = express.Router();

taskRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const tasks = await prismaClient.task.findMany();
    return res.json({ tasks });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

taskRouter.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const parsed = GetTask.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }
    const { id } = parsed.data;
    const task = await prismaClient.task.findUnique({
      where: { id },
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

taskRouter.delete(
  "/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const parsed = DeleteTask.safeParse(req.params);
      if (!parsed.success) return res.status(400).json(parsed.error.flatten());

      const { id } = parsed.data;

      await prismaClient.task.delete({ where: { id } });
      return res.sendStatus(204);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  },
);

taskRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = CreateTask.safeParse(req.body);

    if (!parsed.success) return res.status(400).json(parsed.error.flatten());
    const { title, category, city, pay, description } = parsed.data;

    const task = await prismaClient.task.create({
      data: {
        title,
        category,
        city,
        pay,
        description,
      },
    });

    return res.status(201).json({ id: task.id });
  } catch (error: any) {
    console.log(error);
    return res.sendStatus(500);
  }
});

taskRouter.patch("/tasks/:id", async (req: Request<{ id: string }>, res: Response) => {
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
        id
      },
      data: {
        ...parsedBody.data
      }
    });

    return res.status(200).json({task});

    
  } catch (error: any) {
    console.log(error);
    if (error?.code === "P2025") {
      return res.sendStatus(404);
    }

    res.sendStatus(500);
  }
});

taskRouter.put("/tasks/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const parsedBody = UpdateTaskBody.safeParse(req.body);
    const parsedParams = UpdateTaskParams.safeParse(req.params);

    if (!parsedBody.success) {
      return res.status(400).json(parsedBody.error.flatten());
    }

    if (!parsedParams.success) {
      return res.status(400).json(parsedParams.error.flatten());
    }

    const { id } = req.params;
    console.log(parsedBody.data);

    const task = await prismaClient.task.update({
      where: {
        id,
      },
      data: {
        ...parsedBody.data,
      },
    });

    return res.status(200).json({ task });
  } catch (error) {
    console.log(error);
    if (error.code === "P2025") {
      return res.sendStatus(404);
    }

    res.sendStatus(500);
  }
});