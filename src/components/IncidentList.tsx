import type { Incident } from "../domain";

interface IncidentListProps {
  incidents: Incident[];
  selectedId: string | null;
  onSelect: (incidentId: string) => void;
}

export function IncidentList({ incidents, selectedId, onSelect }: IncidentListProps) {
  if (incidents.length === 0) {
    return <div className="empty-state">No incidents match the current filters.</div>;
  }
  return (
    <div className="incident-list" aria-label="Incident list">
      {incidents.map((incident) => (
        <button
          className={"incident-row " + (selectedId === incident.id ? "is-selected" : "")}
          key={incident.id}
          type="button"
          onClick={() => onSelect(incident.id)}
          aria-pressed={selectedId === incident.id}
        >
          <span className={"severity-dot " + incident.severity} aria-hidden="true" />
          <span className="incident-row-main">
            <strong>{incident.title}</strong>
            <span>{incident.service} · {incident.commander}</span>
          </span>
          <span className="status-pill">{incident.status}</span>
        </button>
      ))}
    </div>
  );
}
