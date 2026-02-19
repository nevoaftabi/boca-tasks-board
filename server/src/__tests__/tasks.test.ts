import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";

let app: any;
let mock: any;

beforeEach(async () => {
  vi.resetModules(); // important: clears the module cache
  vi.clearAllMocks();

  vi.doMock("../services/prisma", () => ({
    prismaClient: {
      task: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      $connect: vi.fn(),
    },
  }));

  // import AFTER doMock so app.ts receives the mocked prismaClient
  ({ prismaClient: mock } = await import("../services/prisma"));
  ({ app } = await import("../app"));
});

describe("tasks routes", () => {
  it("GET /tasks returns tasks", async () => {
    mock.task.findMany.mockResolvedValue([{ id: "1" }]);

    const res = await request(app).get("/tasks");
    expect(res.status).toBe(200);
    expect(res.body.tasks).toEqual([{ id: "1" }]);
  });

  it("POST /tasks returns 201 when created for valid body", async () => {
    mock.task.create.mockResolvedValue({ id: "1"});
    const body = {
      title: "Mow lawn",
      category: "Home",
      city: "Boca Raton",
      pay: 50,
      description: "Front yard only",
    };

    const res = await request(app).post("/tasks").send(body);

    expect(res.status).toBe(201);
    expect(mock.task.create).toHaveBeenCalledTimes(1);
    expect(mock.task.create).toHaveBeenCalledWith({
      data: {
        title: body.title,
        category: body.category,
        city: body.city,
        pay: body.pay,
        description: body.description,
      },
    });
  });

  it("POST /tasks returns 400 and does not create when body is invalid", async () => {
    const res = await request(app).post("/tasks").send({ title: "x" }); // missing fields

    expect(res.status).toBe(400);
    expect(mock.task.create).not.toHaveBeenCalled();
  });

  it("GET /tasks/:id returns 200 when found", async () => {
    mock.task.findUnique.mockResolvedValue({
      id: "59fc977c-85d7-4ca5-a434-a97a827e1495",
    });

    const res = await request(app).get(
      "/tasks/59fc977c-85d7-4ca5-a434-a97a827e1495",
    );
    expect(res.status).toBe(200);
  });

  it("GET /tasks/:id returns 404 when missing", async () => {
    mock.task.findUnique.mockResolvedValue(null);

    const res = await request(app).get(
      "/tasks/59fc977c-85d7-4ca5-a434-a97a827e1495",
    );
    expect(res.status).toBe(404);
  });
});
