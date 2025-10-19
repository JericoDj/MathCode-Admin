// src/components/PackageDetailsDialog/PackagesDialog.tsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import "./PackageDialog.css";
import { PackageContext } from "../../contexts/PackageContext";
import type { Package } from "../../types";

interface PackagesDialogProps {
  open?: boolean;
  onClose?: () => void;
}

const statusKey = (s?: string) => (s ? s.toLowerCase() : "unknown");

export default function PackagesDialog({
  open: propOpen,
  onClose: propOnClose,
}: PackagesDialogProps) {
  // 1) Always call useContext (never conditionally)
  const ctx = useContext(PackageContext);

  useEffect(() => {
    console.log("PackageDetailsDialog mounted");
  }, []);

  // Provide safe fallbacks so we can still call later hooks even if ctx is null
  const packagesFromCtx: Package[] =
    (ctx?.packages as Package[]) ??
    []; // default to []

  const ctxOpen = !!ctx?.dialogOpen;
  const ctxClose = ctx?.closeDialog ?? (() => {});

  // Resolve open/onClose *without* returning yet
  const open = propOpen ?? ctxOpen;
  const onClose = propOnClose ?? ctxClose;

  // 2) Call useMemo/useState on every render (even when !open)
  const packageArray: Package[] = Array.isArray(packagesFromCtx)
    ? packagesFromCtx
    : (Object.values(packagesFromCtx || {}) as Package[]);

  const grouped = useMemo(() => {
    return packageArray.reduce<Record<string, Package[]>>((acc, p) => {
      const key = statusKey(p.status);
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {});
  }, [packageArray]);

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
          <h2>📚 All Package Details</h2>
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
            grouped[currentTab].map((pkg, index) => (
              <PackageCard
                key={pkg.id ?? index}
                pkg={pkg}
                index={index + 1}
              />
            ))
          ) : (
            <p className="empty">No packages found.</p>
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

function PackageCard({ pkg, index }: { pkg: Package; index: number }) {
  const [open, setOpen] = useState(false);

  const dateLabel = pkg.date ? new Date(pkg.date as any).toLocaleDateString() : "—";
  const timeLabel = pkg.time || "—";

  return (
    <div
      className={`package-card ${statusKey(pkg.status)}`}
      onClick={() => setOpen((v) => !v)}
      role="button"
      tabIndex={0}
    >
      <div className="package-header">
        <div className="package-index">{index}</div>
        <div className="package-main">
          <p>
            <strong>{pkg.studentName}</strong> – {pkg.subject}
            {pkg.grade ? <> <small>({pkg.grade})</small></> : null}
          </p>
          <small>{dateLabel} • {timeLabel}</small>
        </div>
        <span className={`status-tag ${statusKey(pkg.status)}`}>
          {pkg.status}
        </span>
      </div>

      {open && (
        <div className="package-details">
          <DetailRow label="Tutor" value={pkg.tutorName} />
          <DetailRow label="Tutor ID" value={pkg.tutorId} />
          <DetailRow label="Student ID" value={pkg.studentId} />
          <DetailRow label="Duration" value={typeof pkg.duration === "number" ? `${pkg.duration} min` : "—"} />
          <DetailRow label="Price" value={typeof pkg.price === "number" ? `$${pkg.price}` : "—"} />
          <DetailRow
            label="Meeting Link"
            value={
              pkg.meetingLink ? (
                <a href={pkg.meetingLink} target="_blank" rel="noreferrer">
                  {pkg.meetingLink}
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