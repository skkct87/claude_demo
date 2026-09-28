import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AccountDetails, type AccountUser } from "../AccountDetails";

afterEach(() => {
  cleanup();
});

const baseUser: AccountUser = {
  email: "jane.doe@example.com",
  username: "jane.doe",
  firstName: "Jane",
  middleName: "Marie",
  lastName: "Doe",
  role: "User",
  status: "Active",
};

test("renders all account fields", () => {
  render(<AccountDetails user={baseUser} />);

  expect(screen.getByText("Jane")).toBeDefined();
  expect(screen.getByText("Marie")).toBeDefined();
  expect(screen.getByText("Doe")).toBeDefined();
  expect(screen.getByText("jane.doe@example.com")).toBeDefined();
  expect(screen.getAllByText("jane.doe").length).toBeGreaterThan(0);
  expect(screen.getAllByText("User").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Active").length).toBeGreaterThan(0);
});

test("renders a placeholder for missing name fields", () => {
  const user: AccountUser = {
    ...baseUser,
    firstName: null,
    middleName: null,
    lastName: null,
  };

  render(<AccountDetails user={user} />);

  expect(screen.getAllByText("—").length).toBe(3);
});

test("shows the username as the display name when no name is set", () => {
  const user: AccountUser = {
    ...baseUser,
    firstName: null,
    lastName: null,
  };

  render(<AccountDetails user={user} />);

  expect(screen.getAllByText("jane.doe").length).toBeGreaterThan(0);
});
