import React, { useEffect, useState, useContext } from "react";
import { LoadingSpinner } from "../../../components/LoadingSpinner/LoadingSpinner";
import { SessionContext } from "../../../contexts/SessionContext";
import type { TutoringSession } from "../../../types";
import "./SessionManagement.css";

export const SessionManagement: React.FC = () => {
  const { sessions, isLoading, openDialog, getSessions, updateSession } =
    useContext(SessionContext);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tempLinks, setTempLinks] = useState<Record<string, string>>({});
  const [linkErrors, setLinkErrors] = useState<Record<string, string | null>>({});
  const [editingRows, setEditingRows] = useState<Record<string, boolean>>({});
  const isAdmin = true;

  useEffect(() => {
    getSessions();
  }, []);

  const filteredSessions = sessions.filter(
    (session: TutoringSession) =>
      statusFilter === "all" || session.status === statusFilter
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "scheduled":
        return "status-scheduled";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      case "no-show":
        return "status-no-show";
      default:
        return "";
    }
  };

  const validateUrl = (value: string) => {
    if (!value) return "Link cannot be empty for scheduled sessions.";
    try {
      const u = new URL(value);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        return "Use http or https URLs only.";
      }
      return null;
    } catch {
      return "Enter a valid URL.";
    }
  };

  const handleStatusChange = (sid: string, newStatus: TutoringSession["status"]) => {
    updateSession(sid, { status: newStatus });
    if (newStatus !== "scheduled") {
      setEditingRows((prev) => ({ ...prev, [sid]: false }));
      setLinkErrors((prev) => ({ ...prev, [sid]: null }));
    }
  };

  const handleLinkChange = (sid: string, value: string) => {
    setTempLinks((prev) => ({ ...prev, [sid]: value }));
    const s = sessions.find((x: any) => (x.id || x._id) === sid);
    if (s?.status === "scheduled") {
      setLinkErrors((prev) => ({
        ...prev,
        [sid]: value
          ? validateUrl(value)
          : "Link cannot be empty for scheduled sessions.",
      }));
    } else {
      setLinkErrors((prev) => ({ ...prev, [sid]: null }));
    }
  };

  const handleEdit = (sid: string) => {
    setEditingRows((prev) => ({ ...prev, [sid]: true }));
  };

  const handleCancel = (sid: string) => {
    const current = sessions.find((x: any) => (x.id || x._id) === sid);
    setTempLinks((prev) => ({ ...prev, [sid]: current?.meetingLink ?? "" }));
    setLinkErrors((prev) => ({ ...prev, [sid]: null }));
    setEditingRows((prev) => ({ ...prev, [sid]: false }));
  };

  const handleSaveLink = async (sid: string) => {
    const s = sessions.find((x: any) => (x.id || x._id) === sid);
    if (!s) return;

    const link = tempLinks[sid]?.trim() ?? "";
    const err = s.status === "scheduled" ? validateUrl(link) : null;
    setLinkErrors((prev) => ({ ...prev, [sid]: err }));
    if (err) return;

    await updateSession(sid, { meetingLink: link });
    setEditingRows((prev) => ({ ...prev, [sid]: false }));
  };

  if (isLoading) {
    return (
      <div className="session-management-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="session-management-container">
      <div className="page-header">
        <h1>Session Management</h1>
        <p>Manage and monitor tutoring sessions</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {["all", "pending", "approved", "scheduled", "completed", "cancelled", "no-show"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`tab-button ${statusFilter === status ? "active" : ""}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Stats */}
      <div className="stats-overview">
        <div className="stat-item">
          <span className="stat-number">
            {sessions.filter((s: TutoringSession) => s.status === "scheduled").length}
          </span>
          <span className="stat-label">Scheduled</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {sessions.filter((s: TutoringSession) => s.status === "completed").length}
          </span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            $
            {sessions.reduce(
              (sum: number, s: TutoringSession) => sum + (s.price || 0),
              0
            )}
          </span>
          <span className="stat-label">Total Revenue</span>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Tutoring Sessions</h2>
          <div className="controls">
            <button className="btn btn-primary" onClick={getSessions}>
              Refresh
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Tutor</th>
                <th>Subject/Grade</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
                <th style={{ width: 420 }}>Meeting Link (Admin)</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "2rem" }}>
                    No sessions found.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session: any) => {
                  const sid = session.id || session._id;
                  const linkValue = tempLinks[sid] ?? session.meetingLink ?? "";
                  const error = linkErrors[sid] ?? null;
                  const isScheduled = session.status === "scheduled";
                  const canEdit = isAdmin && isScheduled;
                  const isEditing = !!editingRows[sid];

                  return (
                    <tr key={sid}>
                      <td><strong>{session.studentName || "-"}</strong></td>
                      <td>{session.tutorName || "-"}</td>
                      <td>
  <div>
    <strong>{session.subject || "-"}</strong>
  </div>
  <div>
    {session.grade ? `${session.grade} Grade` : "-"}
  </div>
</td>
                      <td>
                        {session.date
                          ? new Date(session.date).toLocaleDateString()
                          : session.preferredDate
                          ? new Date(session.preferredDate).toLocaleDateString()
                          : "-"}
                        <br />
                        <small>{session.time || session.preferredTime || "-"}</small>
                      </td>
                      <td>{session.duration ? `${session.duration} min` : "-"}</td>
                      <td>{session.price ? `$${session.price}` : "-"}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(session.status)}`}>
                          {session.status}
                        </span>
                      </td>

                      <td>
                        <div className="meeting-link-editor">
                          <input
                            type="url"
                            className={`input ${error ? "input-error" : ""}`}
                            placeholder={
                              canEdit
                                ? isEditing
                                  ? "https://..."
                                  : "Click Edit to modify"
                                : "No link"
                            }
                            value={linkValue}
                            onChange={(e) => handleLinkChange(sid, e.target.value)}
                            disabled={!(canEdit && isEditing)}
                          />
                          {!isEditing ? (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleEdit(sid)}
                              disabled={!canEdit}
                            >
                              Edit
                            </button>
                          ) : (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleSaveLink(sid)}
                                disabled={!!error}
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleCancel(sid)}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {error && <div className="field-error">{error}</div>}
                          {!canEdit && !linkValue && (
                            <div className="muted small">
                              Set status to “Scheduled” to add a link.
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <select
                            value={session.status}
                            onChange={(e) =>
                              handleStatusChange(
                                sid,
                                e.target.value as TutoringSession["status"]
                              )
                            }
                            className="status-select"
                          >
                            <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no-show">No Show</option>
                          </select>
                          <button onClick={() => openDialog(session)}>Edit Details</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
