import { test, expect } from "vitest";
import { baseUsernameFromEmail, generateUniqueUsername } from "@/lib/username";

test("derives a lowercase username from the email local-part", () => {
  expect(baseUsernameFromEmail("Jane.Doe@example.com")).toBe("jane.doe");
});

test("strips characters that are not letters, digits, underscore, dot, or hyphen", () => {
  expect(baseUsernameFromEmail("john+smith@example.com")).toBe("johnsmith");
});

test("falls back to 'user' when the local-part sanitizes to empty", () => {
  expect(baseUsernameFromEmail("+++@example.com")).toBe("user");
});

test("returns the base username when it is not taken", async () => {
  const username = await generateUniqueUsername(
    "alice@example.com",
    async () => false
  );

  expect(username).toBe("alice");
});

test("appends an incrementing suffix until a free username is found", async () => {
  const taken = new Set(["alice", "alice-2", "alice-3"]);

  const username = await generateUniqueUsername("alice@example.com", async (candidate) =>
    taken.has(candidate)
  );

  expect(username).toBe("alice-4");
});
