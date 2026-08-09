import { describe, expect, it } from "vitest";
import { createIncident, transitionIncident } from "../src/domain";

describe("incident domain", () => {
  it("records declaration and status changes in the timeline", () => {
    const incident = createIncident(
      {
        title: "Checkout errors",
        service: "checkout-api",
        severity: "sev1",
        commander: "Avery",
      },
      new Date("2026-08-09T12:00:00.000Z"),
    );
    const acknowledged = transitionIncident(
      incident,
      "acknowledged",
      "Avery",
      new Date("2026-08-09T12:05:00.000Z"),
    );

    expect(acknowledged.status).toBe("acknowledged");
    expect(acknowledged.timeline).toHaveLength(2);
    expect(acknowledged.timeline[1]?.message).toBe("Status changed to acknowledged");
  });

  it("prevents moving a resolved incident backwards", () => {
    const declared = createIncident({
      title: "Export job backlog",
      service: "reporting-worker",
      severity: "sev3",
      commander: "Avery",
    });
    const resolved = transitionIncident(declared, "resolved", "Avery");

    expect(() => transitionIncident(resolved, "mitigating", "Avery")).toThrow(
      "Cannot transition resolved to mitigating",
    );
  });
});
