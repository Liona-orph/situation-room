export const severities = ["sev1", "sev2", "sev3", "sev4"] as const;
export const statuses = ["declared", "acknowledged", "mitigating", "resolved"] as const;

export type Severity = (typeof severities)[number];
export type IncidentStatus = (typeof statuses)[number];

export interface TimelineEvent {
  id: string;
  at: string;
  author: string;
  message: string;
  kind: "declared" | "status_change" | "update";
}

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: Severity;
  status: IncidentStatus;
  commander: string;
  declaredAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export interface NewIncident {
  title: string;
  service: string;
  severity: Severity;
  commander: string;
}

const allowedTransitions: Record<IncidentStatus, IncidentStatus[]> = {
  declared: ["acknowledged", "mitigating", "resolved"],
  acknowledged: ["mitigating", "resolved"],
  mitigating: ["resolved"],
  resolved: [],
};

export function availableTransitions(status: IncidentStatus): IncidentStatus[] {
  return [...allowedTransitions[status]];
}

function newId(): string {
  return crypto.randomUUID();
}

function clean(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(field + " is required");
  }
  if (normalized.length > 140) {
    throw new Error(field + " must be at most 140 characters");
  }
  return normalized;
}

export function createIncident(input: NewIncident, now = new Date()): Incident {
  const timestamp = now.toISOString();
  const title = clean(input.title, "Title");
  const service = clean(input.service, "Service");
  const commander = clean(input.commander, "Commander");
  return {
    id: newId(),
    title,
    service,
    severity: input.severity,
    status: "declared",
    commander,
    declaredAt: timestamp,
    updatedAt: timestamp,
    timeline: [
      {
        id: newId(),
        at: timestamp,
        author: commander,
        message: "Incident declared",
        kind: "declared",
      },
    ],
  };
}

export function transitionIncident(
  incident: Incident,
  status: IncidentStatus,
  author: string,
  now = new Date(),
): Incident {
  if (!allowedTransitions[incident.status].includes(status)) {
    throw new Error("Cannot transition " + incident.status + " to " + status);
  }
  const timestamp = now.toISOString();
  return {
    ...incident,
    status,
    updatedAt: timestamp,
    timeline: [
      ...incident.timeline,
      {
        id: newId(),
        at: timestamp,
        author: clean(author, "Author"),
        message: "Status changed to " + status,
        kind: "status_change",
      },
    ],
  };
}

export function addUpdate(
  incident: Incident,
  message: string,
  author: string,
  now = new Date(),
): Incident {
  const timestamp = now.toISOString();
  return {
    ...incident,
    updatedAt: timestamp,
    timeline: [
      ...incident.timeline,
      {
        id: newId(),
        at: timestamp,
        author: clean(author, "Author"),
        message: clean(message, "Update"),
        kind: "update",
      },
    ],
  };
}

export function isSeverity(value: string): value is Severity {
  return severities.includes(value as Severity);
}

export function isStatus(value: string): value is IncidentStatus {
  return statuses.includes(value as IncidentStatus);
}
