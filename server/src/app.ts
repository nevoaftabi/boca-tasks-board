import express, { Request, Response, NextFunction } from "express";
import { tasksRouter } from "./routers/tasksRouter";

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

app.use("/tasks", tasksRouter);

app.use((_: Request, res: Response) => res.sendStatus(404));
