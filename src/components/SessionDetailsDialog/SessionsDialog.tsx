import React, { useContext, useState, useEffect } from "react";
import "./SessionDialog.css";
import { SessionContext } from "../../contexts/SessionContext";
import type { Session } from "../../types";

interface SessionsDialogProps {
  open?: boolean;
  onClose?: () => void;
}

const statusKey = (s?: string) => (s ? s.toLowerCase() : "unknown");

export default function SessionsDialog({
  open: propOpen,
  onClose: propOnClose,
}: SessionsDialogProps) {
  const ctx = useContext(SessionContext);
  const sessionArray: Session[] = Array.isArray(ctx?.sessions)
    ? (ctx!.sessions as Session[])
    : (Object.values(ctx?.sessions || {}) as Session[]);

  const open = propOpen ?? !!ctx?.dialogOpen;
  const onClose = propOnClose ?? ctx?.closeDialog ?? (() => {});

  const grouped: Record<string, Session[]> = {};
  for (const s of sessionArray) {
    const key = statusKey(s.status);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  }

  useEffect(() => {
    console.log("SessionsDialog mounted");
  }, []);

  const statuses = Object.keys(grouped);
  const [activeTab, setActiveTab] = useState<string>(statuses[0] || "");
  const currentTab = activeTab || statuses[0] || "";

  if (!open) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog-box wide">
        <header className="dialog-header">
          <h2>📚 All Session Details</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </header>

        <div className="tab-header scroll-x">
          {statuses.map((status) => (
            <button
              key={status}
              className={`tab-btn ${currentTab === status ? "active" : ""}`}
              onClick={() => setActiveTab(status)}
            >
              {status.toUpperCase()} ({grouped[status].length})
            </button>
          ))}
        </div>

        <div className="tab-scroll-container scroll-y">
          {grouped[currentTab]?.length ? (
            grouped[currentTab].map((session, index) => (
              <SessionCard key={session.id ?? index} session={session} index={index + 1} />
            ))
          ) : (
            <p className="empty">No sessions found.</p>
          )}
        </div>

        <footer className="dialog-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// SESSION CARD COMPONENT WITH EDIT FUNCTIONALITY
// ────────────────────────────────────────────────
function SessionCard({ session, index }: { session: Session; index: number }) {
  const { updateSession } = useContext(SessionContext);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const sid = session.id || session._id; // Ensure session ID is defined

  const [form, setForm] = useState({
  tutorName: session.tutorName || "",
  tutorId: session.tutorId || "",
  studentName: session.studentName || "",
  subject: session.subject || "",
  grade: session.grade || "",
  duration: session.duration?.toString() || "",
  price: session.price?.toString() || "",
  meetingLink: session.meetingLink || "",
  date: session.date ? new Date(session.date).toISOString().substring(0, 10) : "",
  time: session.time || "",
});

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
  const updatedData = {
    ...session,
    tutorName: form.tutorName.trim(),
    tutorId: form.tutorId.trim(),
    studentName: form.studentName.trim(),
    subject: form.subject.trim(),
    grade: form.grade.trim(),
    duration: Number(form.duration) || 0,
    price: Number(form.price) || 0,
    meetingLink: form.meetingLink.trim(),
    date: form.date ? new Date(form.date).toISOString() : null,
    time: form.time.trim(),
  };
  await updateSession(sid, updatedData);
  setEditing(false);
};


  const handleCancel = () => {
    setEditing(false);
    setForm({
      tutorName: session.tutorName || "",
      tutorId: session.tutorId || "",
      studentName: session.studentName || "",
  subject: session.subject || "",      
  grade: session.grade || "",        
      duration: session.duration?.toString() || "",
      price: session.price?.toString() || "",
      meetingLink: session.meetingLink || "",
      date: session.date ? new Date(session.date).toISOString().substring(0, 10) : "",
      time: session.time || "",
    });
  };

  const dateLabel = form.date ? new Date(form.date).toLocaleDateString() : "—";
  const timeLabel = form.time || "—";

  return (
    <div
  className={`session-card ${statusKey(session.status)}`}
  onClick={(e) => {
    // Only toggle open/close if the click was directly on the card,
    // not on inputs, buttons, or selects.
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "BUTTON" ||
      target.tagName === "SELECT" ||
      target.closest("input, button, select, a")
    ) {
      e.stopPropagation();
      return;
    }
    setOpen((v) => !v);
  }}
  role="button"
  tabIndex={0}
>

      <div className="session-header">
        <div className="session-index">{index}</div>
        <div className="session-main">
          <p>
            <strong>{session.studentName}</strong> – {session.subject}
            {session.grade ? <> <small>({session.grade})</small></> : null}
          </p>
          <small>{dateLabel} • {timeLabel}</small>
        </div>
        <span className={`status-tag ${statusKey(session.status)}`}>
          {session.status}
        </span>
      </div>

      {open && (
        <div className="session-details">
          <EditableRow
            editing={editing}
            label="Tutor"
            value={form.tutorName}
            onChange={(v) => handleChange("tutorName", v)}
          />
          <EditableRow
            editing={editing}
            label="Tutor ID"
            value={form.tutorId}
            onChange={(v) => handleChange("tutorId", v)}
          />
          <EditableRow
            editing={editing}
            label="Student Name"
            value={form.studentName}
            onChange={(v) => handleChange("studentName", v)}
          />
          <EditableRow
  editing={editing}
  label="Subject"
  value={form.subject}
  onChange={(v) => handleChange("subject", v)}
/>
<EditableRow
  editing={editing}
  label="Grade"
  value={form.grade}
  onChange={(v) => handleChange("grade", v)}
/>
          <EditableRow
            editing={editing}
            label="Duration (min)"
            value={form.duration}
            onChange={(v) => handleChange("duration", v)}
          />
          
          <EditableRow
            editing={editing}
            label="Price ($)"
            value={form.price}
            onChange={(v) => handleChange("price", v)}
          />
          <EditableRow
            editing={editing}
            label="Meeting Link"
            value={form.meetingLink}
            onChange={(v) => handleChange("meetingLink", v)}
          />
          <EditableRow
            editing={editing}
            label="Date"
            type="date"
            value={form.date}
            onChange={(v) => handleChange("date", v)}
          />
          <EditableRow
            editing={editing}
            label="Time"
            type="time"
            value={form.time}
            onChange={(v) => handleChange("time", v)}
          />

          <div className="edit-actions">
            {!editing ? (
              <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); setEditing(true); }}>
                Edit
              </button>
            ) : (
              <>
                <button className="btn-primary" onClick={(e) => { e.stopPropagation(); handleSave(); }}>
                  Save
                </button>
                <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); handleCancel(); }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// REUSABLE COMPONENT FOR READ/EDIT ROWS
// ────────────────────────────────────────────────
function EditableRow({
  label,
  value,
  editing,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="detail-row">
      <strong>{label}:</strong>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="edit-input"
        />
      ) : (
        <span>{value || "—"}</span>
      )}
    </div>
  );
}
