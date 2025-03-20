import { describe, expect, test } from "bun:test";
import app from "./index";

describe("Hono API", () => {
  test("should return hello message", async () => {
    const res = await app.request("http://localhost/");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello Hono!");
  });
});
