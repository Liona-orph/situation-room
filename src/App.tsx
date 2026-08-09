import { useState } from "react";
import { IncidentDetail } from "./components/IncidentDetail";
import { IncidentList } from "./components/IncidentList";
import { NewIncidentForm } from "./components/NewIncidentForm";
import { severities, statuses, type Severity } from "./domain";
import { useIncidentStore } from "./store";

type SeverityFilter = Severity | "all";
type StatusFilter = (typeof statuses)[number] | "all";

function Metric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export default function App() {
  const { incidents, create, transition, addTimelineUpdate } = useIncidentStore();
  const [selectedId, setSelectedId] = useState<string | null>(incidents[0]?.id || null);
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [isDeclaring, setIsDeclaring] = useState(false);

  const visibleIncidents = incidents.filter(
    (incident) =>
      (severity === "all" || incident.severity === severity) &&
      (status === "all" || incident.status === status),
  );
  const selected =
    visibleIncidents.find((incident) => incident.id === selectedId) ||
    visibleIncidents[0] ||
    null;
  const openCount = incidents.filter((incident) => incident.status !== "resolved").length;
  const urgentCount = incidents.filter(
    (incident) =>
      incident.status !== "resolved" &&
      (incident.severity === "sev1" || incident.severity === "sev2"),
  ).length;
  const resolvedCount = incidents.filter((incident) => incident.status === "resolved").length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Situation Room home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>Situation Room</span>
        </a>
        <div className="topbar-status">
          <span className="pulse-dot" aria-hidden="true" />
          Local workspace · auto-saved
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">Operations workspace</p>
            <h1>Keep the response crisp when the system is not.</h1>
            <p className="hero-copy">
              Declare incidents, assign clear ownership, and preserve the decision trail in one focused view.
            </p>
          </div>
          <button className="primary-button" type="button" onClick={() => setIsDeclaring(true)}>
            + Declare incident
          </button>
        </section>

        <section className="metrics" aria-label="Incident summary">
          <Metric label="Open incidents" value={openCount} detail="Need active coordination" />
          <Metric label="Urgent" value={urgentCount} detail="SEV1 and SEV2" />
          <Metric label="Resolved" value={resolvedCount} detail="Saved in this workspace" />
        </section>

        {isDeclaring ? (
          <NewIncidentForm
            onCreate={(input) => {
              const incident = create(input);
              setSelectedId(incident.id);
            }}
            onClose={() => setIsDeclaring(false)}
          />
        ) : null}

        <section className="workspace">
          <div className="incident-column">
            <div className="section-heading list-heading">
              <div>
                <p className="eyebrow">Active queue</p>
                <h2>Incidents</h2>
              </div>
              <span>{visibleIncidents.length} shown</span>
            </div>
            <div className="filters" aria-label="Incident filters">
              <label>
                Severity
                <select value={severity} onChange={(event) => setSeverity(event.target.value as SeverityFilter)}>
                  <option value="all">All severities</option>
                  {severities.map((option) => (
                    <option key={option} value={option}>{option.toUpperCase()}</option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
                  <option value="all">All statuses</option>
                  {statuses.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
            <IncidentList
              incidents={visibleIncidents}
              selectedId={selected?.id || null}
              onSelect={setSelectedId}
            />
          </div>
          <IncidentDetail
            key={selected?.id || "empty"}
            incident={selected}
            onTransition={transition}
            onAddUpdate={addTimelineUpdate}
          />
        </section>
      </main>
    </div>
  );
}
