import { useState, type FormEvent } from "react";
import { severities, type NewIncident, type Severity } from "../domain";

interface NewIncidentFormProps {
  onCreate: (input: NewIncident) => void;
  onClose: () => void;
}

export function NewIncidentForm({ onCreate, onClose }: NewIncidentFormProps) {
  const [title, setTitle] = useState("");
  const [service, setService] = useState("");
  const [commander, setCommander] = useState("");
  const [severity, setSeverity] = useState<Severity>("sev2");
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      onCreate({ title, service, commander, severity });
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create incident");
    }
  }

  return (
    <section className="form-card" aria-labelledby="declare-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Command center</p>
          <h2 id="declare-heading">Declare an incident</h2>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close form">
          ×
        </button>
      </div>
      <form onSubmit={submit}>
        <label>
          Incident title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What is impacted?"
            autoFocus
          />
        </label>
        <label>
          Service
          <input
            value={service}
            onChange={(event) => setService(event.target.value)}
            placeholder="checkout-api"
          />
        </label>
        <div className="form-grid">
          <label>
            Severity
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value as Severity)}
            >
              {severities.map((option) => (
                <option key={option} value={option}>
                  {option.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label>
            Incident commander
            <input
              value={commander}
              onChange={(event) => setCommander(event.target.value)}
              placeholder="Your name"
            />
          </label>
        </div>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="primary-button" type="submit">Declare incident</button>
      </form>
    </section>
  );
}
