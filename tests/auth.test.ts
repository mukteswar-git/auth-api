import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";

const testEmail = `test-${randomUUID()}@example.com`;
const testPassword = "secret123";

describe("POST /auth/register", () => {
  it("registers a new user", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      email: testEmail,
    });
    expect(response.body.passwordHash).toBeUndefined();
  });

  it("rejects invalid registration data", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: "not-an-email",
        password: "short",
      });

    expect(response.status).toBe(400);
  });

  it("rejects a duplicate email", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: "Email already exists",
    });
  });
});

describe("POST /auth/login", () => {
  it("logs in with valid credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "swagger@example.com",
        password: "secret123",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: "Ok",
    });
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("rejects an incorrect password", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "swagger@example.com",
        password: "wrongpassword",
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Invalid credentials",
    });
  });

  it("rejects an unknown email", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "does-not-exist@example.com",
        password: "secret123",
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Invalid credentials",
    });
  });
});

describe("GET /auth/me", () => {
  it("rejects an unauthenticated request", async () => {
    const response = await request(app)
      .get("/auth/me");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Not authenticated",
    });
  });
});

describe("Authentication session flow", () => {
  it("logs in, accesses /me, logs out, and invalidates the session", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "swagger@example.com",
        password: "secret123",
      });

    expect(loginResponse.status).toBe(200);

    const setCookie = loginResponse.headers["set-cookie"];

    expect(setCookie).toBeDefined();

    const sessionCookie = Array.isArray(setCookie)
      ? setCookie.find((cookie) => cookie.startsWith("sessionId="))
      : setCookie.startsWith("sessionId=")
        ? setCookie
        : undefined;

    expect(sessionCookie).toBeDefined();

    const cookie = sessionCookie!.split(";")[0];
    const meResponse = await request(app)
      .get("/auth/me")
      .set("Cookie", cookie);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body).toMatchObject({
      email: "swagger@example.com",
    });

    const logoutResponse = await request(app)
      .post("/auth/logout")
      .set("Cookie", cookie);

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body).toEqual({
      success: "Logged out",
    });

    const staleSessionResponse = await request(app)
      .get("/auth/me")
      .set("Cookie", cookie);

    expect(staleSessionResponse.status).toBe(401);
    expect(staleSessionResponse.body).toEqual({
      error: "Invalid session",
    });
  });
});
