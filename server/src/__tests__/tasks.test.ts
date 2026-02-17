import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { app } from "../app";

vi.mock("../services/prisma", () => ({
  prismaClient: {
    task: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    $connect: vi.fn(),
  },
}));

import { prismaClient } from "../services/prisma";

const mock = prismaClient as unknown as {
  task: {
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};

describe("tasks routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /tasks returns tasks", async () => {
    mock.task.findMany.mockResolvedValue([{ id: "1" }]);
    const res = await request(app).get("/tasks");

    expect(res.status).toBe(200);
    expect(res.body.tasks).toEqual([{ id: "1" }]);
  });

  it("POST /tasks returns 400 for invalid body", async () => {
    const res = await request(app).post("/tasks").send({ title: "x" });

    expect(res.status).toBe(400);
    expect(mock.task.create).not.toHaveBeenCalled();
  });

  it("DELETE /tasks/:id returns 400 for invalid uuid", async () => {
    const res = await request(app).delete("/tasks/not-a-uuid");

    expect(res.status).toBe(400);
    expect(mock.task.delete).not.toHaveBeenCalled()
  });
});
