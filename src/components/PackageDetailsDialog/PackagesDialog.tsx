import { useContext, useState, useEffect } from "react";
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
  const ctx = useContext(PackageContext);
  const packageArray: Package[] = Array.isArray(ctx?.packages)
    ? (ctx!.packages as Package[])
    : (Object.values(ctx?.packages || {}) as Package[]);

  const open = propOpen ?? !!ctx?.dialogOpen;
  const onClose = propOnClose ?? ctx?.closeDialog ?? (() => {});

  const grouped: Record<string, Package[]> = {};
  for (const p of packageArray) {
    const key = statusKey(p.status);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }

  useEffect(() => {
    console.log("PackagesDialog mounted");
  }, []);

  const statuses = Object.keys(grouped);
  const [activeTab, setActiveTab] = useState<string>(statuses[0] || "");
  const currentTab = activeTab || statuses[0] || "";

  if (!open) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog-box wide">
        <header className="dialog-header">
          <h2>📚 All Package Details</h2>
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
            grouped[currentTab].map((pkg, index) => (
              <PackageCard key={pkg.id ?? index} package={pkg} index={index + 1} />
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

// ────────────────────────────────────────────────
// PACKAGE CARD COMPONENT WITH EDIT FUNCTIONALITY
// ────────────────────────────────────────────────
function PackageCard({ package: pkg, index }: { package: Package; index: number }) {
  const { updatePackage } = useContext(PackageContext);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const pid = pkg.id || pkg._id; // Ensure package ID is defined

  const [form, setForm] = useState({
    tutorName: pkg.tutorName || "",
    tutorId: pkg.tutorId || "",
    studentName: pkg.studentName || "",
    subject: pkg.subject || "",
    grade: pkg.grade || "",
    duration: pkg.duration?.toString() || "",
    price: pkg.price?.toString() || "",
    meetingLink: pkg.meetingLink || "",
    date: pkg.date ? new Date(pkg.date).toISOString().substring(0, 10) : "",
    time: pkg.time || "",
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const updatedData = {
      ...pkg,
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
    await updatePackage(pid, updatedData);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({
      tutorName: pkg.tutorName || "",
      tutorId: pkg.tutorId || "",
      studentName: pkg.studentName || "",
      subject: pkg.subject || "",      
      grade: pkg.grade || "",        
      duration: pkg.duration?.toString() || "",
      price: pkg.price?.toString() || "",
      meetingLink: pkg.meetingLink || "",
      date: pkg.date ? new Date(pkg.date).toISOString().substring(0, 10) : "",
      time: pkg.time || "",
    });
  };

  const dateLabel = form.date ? new Date(form.date).toLocaleDateString() : "—";
  const timeLabel = form.time || "—";

  return (
    <div
      className={`package-card ${statusKey(pkg.status)}`}
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