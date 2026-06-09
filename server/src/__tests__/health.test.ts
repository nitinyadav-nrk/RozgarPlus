import request from "supertest";
import { describe, expect, it } from "vitest";

process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test";

const { default: app } = await import("../app");

describe("Backend health endpoint", () => {
  it("should return 200 OK and status ok", async () => {
    const response = await request(app).get("/api/healthz");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
