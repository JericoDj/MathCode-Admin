// src/components/SessionDetailsDialog/SessionsDialog.tsx
import React, { useContext, useEffect, useMemo, useState } from "react";
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
  // 1) Always call useContext (never conditionally)
  const ctx = useContext(SessionContext);

  useEffect(() => {
    console.log("SessionDetailsDialog mounted");
  }, []);

  // Provide safe fallbacks so we can still call later hooks even if ctx is null
  const sessionsFromCtx: Session[] =
    (ctx?.sessions as Session[]) ??
    []; // default to []

  const ctxOpen = !!ctx?.dialogOpen;
  const ctxClose = ctx?.closeDialog ?? (() => {});

  // Resolve open/onClose *without* returning yet
  const open = propOpen ?? ctxOpen;
  const onClose = propOnClose ?? ctxClose;

  // 2) Call useMemo/useState on every render (even when !open)
  const sessionArray: Session[] = Array.isArray(sessionsFromCtx)
    ? sessionsFromCtx
    : (Object.values(sessionsFromCtx || {}) as Session[]);

  const grouped = useMemo(() => {
    return sessionArray.reduce<Record<string, Session[]>>((acc, s) => {
      const key = statusKey(s.status);
      if (!acc[key]) acc[key] = [];
      acc[key].push(s);
      return acc;
    }, {});
  }, [sessionArray]);

  const statuses = Object.keys(grouped);
  const [activeTab, setActiveTab] = useState<string>("");

  // Derive the currently visible tab key
  const currentTab = activeTab || statuses[0] || "";

  // 3) Only decide to render nothing *after* all hooks are called
  if (!open) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog-box wide">
        <header className="dialog-header">
          <h2>📚 All Session Details</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </header>

        {/* Scrollable Status Tabs */}
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

        {/* Main Scroll Container (Vertical) */}
        <div className="tab-scroll-container scroll-y">
          {grouped[currentTab]?.length ? (
            grouped[currentTab].map((session, index) => (
              <SessionCard
                key={session.id ?? index}
                session={session}
                index={index + 1}
              />
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

function SessionCard({ session, index }: { session: Session; index: number }) {
  const [open, setOpen] = useState(false);

  const dateLabel = session.date ? new Date(session.date as any).toLocaleDateString() : "—";
  const timeLabel = session.time || "—";

  return (
    <div
      className={`session-card ${statusKey(session.status)}`}
      onClick={() => setOpen((v) => !v)}
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
          <DetailRow label="Tutor" value={session.tutorName} />
          <DetailRow label="Tutor ID" value={session.tutorId} />
          <DetailRow label="Student ID" value={session.studentId} />
          <DetailRow label="Duration" value={typeof session.duration === "number" ? `${session.duration} min` : "—"} />
          <DetailRow label="Price" value={typeof session.price === "number" ? `$${session.price}` : "—"} />
          <DetailRow
            label="Meeting Link"
            value={
              session.meetingLink ? (
                <a href={session.meetingLink} target="_blank" rel="noreferrer">
                  {session.meetingLink}
                </a>
              ) : "—"
            }
          />
          <DetailRow label="Date" value={dateLabel} />
          <DetailRow label="Time" value={timeLabel} />
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="detail-row">
      <strong>{label}:</strong> <span>{value ?? "—"}</span>
    </div>
  );
}
