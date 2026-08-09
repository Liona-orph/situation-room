import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../src/App";

describe("Situation Room", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("declares a new incident through the command-center form", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /declare incident/i }));
    await user.type(screen.getByLabelText("Incident title"), "Payments are timing out");
    await user.type(screen.getByLabelText("Service"), "payments-api");
    await user.type(screen.getByLabelText("Incident commander"), "Rin");
    await user.click(screen.getByRole("button", { name: "Declare incident" }));

    expect(screen.getByRole("heading", { name: "Payments are timing out" })).toBeInTheDocument();
    expect(screen.getByText("payments-api · Rin")).toBeInTheDocument();
  });

  it("adds an operational update to the selected incident", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByLabelText("Add an operational update"),
      "Cache purge started; watching p95 latency.",
    );
    await user.click(screen.getByRole("button", { name: "Post update" }));

    expect(screen.getByText("Cache purge started; watching p95 latency.")).toBeInTheDocument();
  });
});
