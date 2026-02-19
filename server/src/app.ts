import express, { Request, Response, NextFunction } from "express";
import {
  DeleteTask,
  CreateTask,
  GetTask,
  UpdateTaskParams,
  UpdateTaskBody,
} from "./services/schemas";
import { prismaClient } from "./services/prisma";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ message: "Invalid JSON" });
  }
  next();
});

app.get("/tasks", async (_req: Request, res: Response) => {
  try {
    const tasks = await prismaClient.task.findMany();
    return res.json({ tasks });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

app.get("/tasks/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const parsed = GetTask.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }
    const { id } = req.params;
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

app.delete(
  "/tasks/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const parsed = DeleteTask.safeParse(req.params);
      if (!parsed.success) return res.status(400).json(parsed.error.flatten());

      const { id } = req.params;

      await prismaClient.task.delete({ where: { id } });
      return res.sendStatus(204);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  },
);

app.post("/tasks", async (req: Request, res: Response) => {
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
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

app.put("/tasks/:id", async (req: Request<{id: string}>, res: Response) => {
  try {
    const parsedBody = UpdateTaskBody.safeParse(req.body);
    const parsedParams = UpdateTaskParams.safeParse(req.params);

    if(!parsedBody.success) {
      return res.status(400).json(parsedBody.error.flatten());
    }

    if(!parsedParams.success) {
      return res.status(400).json(parsedParams.error.flatten())
    }

    const { id } = req.params;
    console.log(parsedBody.data);

    const task = await prismaClient.task.update({
      where: { 
        id
      },
      data: {
        ...parsedBody.data
      }
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

app.use((_: Request, res: Response) => res.sendStatus(404));
