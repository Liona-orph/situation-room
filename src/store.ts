import { useCallback, useEffect, useReducer } from "react";
import {
  addUpdate,
  createIncident,
  isSeverity,
  isStatus,
  transitionIncident,
  type Incident,
  type IncidentStatus,
  type NewIncident,
} from "./domain";

const storageKey = "situation-room:v1";

interface PersistedState {
  version: 1;
  incidents: Incident[];
}

interface State {
  incidents: Incident[];
}

type Action =
  | { type: "create"; incident: Incident }
  | { type: "transition"; incidentId: string; status: IncidentStatus; author: string }
  | { type: "update"; incidentId: string; message: string; author: string };

const seedIncidents: Incident[] = [
  {
    id: "inc_seed_checkout",
    title: "Elevated checkout latency",
    service: "checkout-api",
    severity: "sev2",
    status: "mitigating",
    commander: "Maya Chen",
    declaredAt: "2026-08-09T13:12:00.000Z",
    updatedAt: "2026-08-09T13:29:00.000Z",
    timeline: [
      {
        id: "evt_seed_declared",
        at: "2026-08-09T13:12:00.000Z",
        author: "Maya Chen",
        message: "Incident declared",
        kind: "declared",
      },
      {
        id: "evt_seed_update",
        at: "2026-08-09T13:29:00.000Z",
        author: "Maya Chen",
        message: "Traffic shifted away from the degraded dependency",
        kind: "update",
      },
    ],
  },
  {
    id: "inc_seed_exports",
    title: "Export job backlog",
    service: "reporting-worker",
    severity: "sev3",
    status: "acknowledged",
    commander: "Noah Patel",
    declaredAt: "2026-08-09T11:45:00.000Z",
    updatedAt: "2026-08-09T12:02:00.000Z",
    timeline: [
      {
        id: "evt_seed_exports",
        at: "2026-08-09T11:45:00.000Z",
        author: "Noah Patel",
        message: "Incident declared",
        kind: "declared",
      },
    ],
  },
];

function cloneSeeds(): Incident[] {
  return structuredClone(seedIncidents);
}

function isIncident(value: unknown): value is Incident {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<Incident>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.service === "string" &&
    typeof candidate.commander === "string" &&
    typeof candidate.declaredAt === "string" &&
    typeof candidate.updatedAt === "string" &&
    typeof candidate.severity === "string" &&
    isSeverity(candidate.severity) &&
    typeof candidate.status === "string" &&
    isStatus(candidate.status) &&
    Array.isArray(candidate.timeline)
  );
}

function loadIncidents(): Incident[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return cloneSeeds();
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (parsed.version === 1 && Array.isArray(parsed.incidents) && parsed.incidents.every(isIncident)) {
      return parsed.incidents;
    }
  } catch {
    // A corrupt cache should never prevent an operator from opening the workspace.
  }
  return cloneSeeds();
}

function persist(incidents: Incident[]): void {
  const payload: PersistedState = { version: 1, incidents };
  window.localStorage.setItem(storageKey, JSON.stringify(payload));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "create":
      return { incidents: [action.incident, ...state.incidents] };
    case "transition":
      return {
        incidents: state.incidents.map((incident) =>
          incident.id === action.incidentId
            ? transitionIncident(incident, action.status, action.author)
            : incident,
        ),
      };
    case "update":
      return {
        incidents: state.incidents.map((incident) =>
          incident.id === action.incidentId ? addUpdate(incident, action.message, action.author) : incident,
        ),
      };
  }
}

export function useIncidentStore() {
  const [state, dispatch] = useReducer(reducer, { incidents: loadIncidents() });

  useEffect(() => {
    persist(state.incidents);
  }, [state.incidents]);

  const create = useCallback((input: NewIncident): Incident => {
    const incident = createIncident(input);
    dispatch({ type: "create", incident });
    return incident;
  }, []);

  const transition = useCallback((incidentId: string, status: IncidentStatus, author: string) => {
    dispatch({ type: "transition", incidentId, status, author });
  }, []);

  const addTimelineUpdate = useCallback((incidentId: string, message: string, author: string) => {
    dispatch({ type: "update", incidentId, message, author });
  }, []);

  return {
    incidents: state.incidents,
    create,
    transition,
    addTimelineUpdate,
  };
}
