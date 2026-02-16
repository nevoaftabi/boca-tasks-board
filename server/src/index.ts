import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();
const { PORT, DATABASE_URL } = process.env;

if (!PORT || !DATABASE_URL) {
  throw new Error("Environment variables are missing");
}

const prismaPg = new PrismaPg({
  connectionString: DATABASE_URL!
});

export const prismaClient = new PrismaClient({
  adapter: prismaPg
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if(err instanceof SyntaxError) {
    return res.sendStatus(400);
  }

  next();
});

const DeleteTask = z.object({
  id: z.uuid()
})

const CreateTask = z.object({
  title: z.string().trim(),
  category: z.string().trim(),
  city: z.string().trim(),
  description: z.string().trim(),
  pay: z
    .number()
    .refine(
      (val) => Number.isFinite(val) && /^\d+\.\d{2}$/.test(val.toFixed(2)),
      {
        message: "Must have exactly 2 decimal places",
      },
    )
    .min(10),
});

app.get("/tasks", async (req: Request, res: Response) => {
  try {
    const tasks = await prismaClient.task.findMany();

    console.log(`Returning tasks: ${JSON.stringify(tasks)}`)
    res.json({ tasks });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.delete('/tasks/:id', async (req: Request<{id: string}>, res: Response) => {
  try {
    const { id } = req.params;
    const result = DeleteTask.safeParse({ id });

    if(!result.success) {
      console.log(result);
      return res.sendStatus(400);
    }

    const task = await prismaClient.task.delete({
      where: {
        id
      }
    })      

    console.log(`Deleted a task: ${JSON.stringify(task)}`)
    res.sendStatus(204);
  }
  catch(error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.post("/tasks", async (req: Request, res: Response) => {
  try {
    const { title, description, category, city, pay } = req.body;
    const result = CreateTask.safeParse({ title, category, description, city, pay });

    if(!result.success) {
      console.log(result);
      return res.sendStatus(400);
    }

    const task = await prismaClient.task.create({
      data: {
        title,
        category,
        city,
        pay,
        description,
      },
    });

    console.log(`Created a task: ${JSON.stringify(task)}`)
    return res.sendStatus(201);
  } 
  catch (error) {
    console.log(error);

    return res.sendStatus(500);
  }
});


app.use((_: Request, res: Response) => {
  res.sendStatus(404);
});

app.listen(PORT, async () => {
  await prismaClient.$connect();
  console.log("App is listening on port 3000");
});
