import { useState, type FormEvent } from "react";
import {
  availableTransitions,
  type Incident,
  type IncidentStatus,
} from "../domain";

interface IncidentDetailProps {
  incident: Incident | null;
  onTransition: (incidentId: string, status: IncidentStatus, author: string) => void;
  onAddUpdate: (incidentId: string, message: string, author: string) => void;
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function IncidentDetail({ incident, onTransition, onAddUpdate }: IncidentDetailProps) {
  const [author, setAuthor] = useState(incident?.commander || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!incident) {
    return (
      <aside className="detail-panel empty-detail">
        <p>Select an incident to review its operational timeline.</p>
      </aside>
    );
  }
  const incidentId = incident.id;

  function changeStatus(status: IncidentStatus) {
    try {
      onTransition(incidentId, status, author);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not change incident status");
    }
  }

  function submitUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      onAddUpdate(incidentId, message, author);
      setMessage("");
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not add update");
    }
  }

  return (
    <aside className="detail-panel" aria-label={"Incident details for " + incident.title}>
      <div className="detail-header">
        <div>
          <p className="eyebrow">{incident.service}</p>
          <h2>{incident.title}</h2>
        </div>
        <span className={"severity-badge " + incident.severity}>{incident.severity.toUpperCase()}</span>
      </div>
      <div className="detail-meta">
        <div><span>Commander</span><strong>{incident.commander}</strong></div>
        <div><span>Status</span><strong>{incident.status}</strong></div>
        <div><span>Declared</span><strong>{formatTime(incident.declaredAt)}</strong></div>
      </div>

      <label className="inline-label">
        Acting as
        <input value={author} onChange={(event) => setAuthor(event.target.value)} />
      </label>

      {availableTransitions(incident.status).length > 0 ? (
        <div className="status-actions" aria-label="Incident status actions">
          {availableTransitions(incident.status).map((status) => (
            <button key={status} type="button" onClick={() => changeStatus(status)}>
              Mark {status}
            </button>
          ))}
        </div>
      ) : (
        <p className="resolved-note">This incident is resolved. Its timeline remains available for review.</p>
      )}

      <section className="timeline-section" aria-labelledby="timeline-heading">
        <div className="section-heading">
          <h3 id="timeline-heading">Operational timeline</h3>
          <span>{incident.timeline.length} entries</span>
        </div>
        <ol className="timeline">
          {[...incident.timeline].reverse().map((event) => (
            <li key={event.id}>
              <span className={"timeline-marker " + event.kind} aria-hidden="true" />
              <div>
                <p>{event.message}</p>
                <small>{event.author} · {formatTime(event.at)}</small>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <form className="update-form" onSubmit={submitUpdate}>
        <label>
          Add an operational update
          <textarea
            rows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="What changed, what is next, and who owns it?"
          />
        </label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="secondary-button" type="submit">Post update</button>
      </form>
    </aside>
  );
}
