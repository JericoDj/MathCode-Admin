import React, { useEffect, useState, useContext } from "react";
import { LoadingSpinner } from "../../../components/LoadingSpinner/LoadingSpinner";
import { PackageContext } from "../../../contexts/PackageContext";
import type { TutoringPackage } from "../../../types";
import { CreatePackageModal } from "./CreatePackageModal";
import "./PackageManagement.css";

export const PackageManagement: React.FC = () => {
  const { packages, isLoading, openDialog, getPackages, updatePackage } =
    useContext(PackageContext);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tempLinks, setTempLinks] = useState<Record<string, string>>({});
  const [linkErrors, setLinkErrors] = useState<Record<string, string | null>>({});
  const [editingRows, setEditingRows] = useState<Record<string, boolean>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const isAdmin = true;

  useEffect(() => {
    getPackages();
  }, []);

  const filteredPackages = packages.filter(
    (pkg: any) => statusFilter === "all" || pkg.status === statusFilter
  );

  // Function to format status for display
  const formatStatusDisplay = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "Pending Payment";
      case "requested_assessment":
        return "Assessment Requested";
      case "scheduled":
        return "Scheduled";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "no-show":
        return "No Show";
      case "approved":
        return "Approved";
      default:
        return status;
    }
  };

  // Function to format status for tabs/filter
  const formatFilterStatus = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "Pending Payment";
      case "requested_assessment":
        return "Assessment Requested";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending_payment":
      case "requested_assessment":
        return "status-pending";
      case "scheduled":
        return "status-scheduled";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      case "no-show":
        return "status-no-show";
      case "approved":
        return "status-approved";
      default:
        return "";
    }
  };

  const validateUrl = (value: string) => {
    if (!value) return "Link cannot be empty for scheduled packages.";
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

  const handleStatusChange = (pid: string, newStatus: TutoringPackage["status"]) => {
    updatePackage(pid, { status: newStatus });
    if (newStatus !== "scheduled") {
      setEditingRows((prev) => ({ ...prev, [pid]: false }));
      setLinkErrors((prev) => ({ ...prev, [pid]: null }));
    }
  };

  const handleLinkChange = (pid: string, value: string) => {
    setTempLinks((prev) => ({ ...prev, [pid]: value }));
    const p = packages.find((x: any) => (x.id || x._id) === pid);
    if (p?.status === "scheduled") {
      setLinkErrors((prev) => ({
        ...prev,
        [pid]: value
          ? validateUrl(value)
          : "Link cannot be empty for scheduled packages.",
      }));
    } else {
      setLinkErrors((prev) => ({ ...prev, [pid]: null }));
    }
  };

  const handleEdit = (pid: string) => {
    setEditingRows((prev) => ({ ...prev, [pid]: true }));
  };

  const handleCancel = (pid: string) => {
    const current = packages.find((x: any) => (x.id || x._id) === pid);
    setTempLinks((prev) => ({ ...prev, [pid]: current?.meetingLink ?? "" }));
    setLinkErrors((prev) => ({ ...prev, [pid]: null }));
    setEditingRows((prev) => ({ ...prev, [pid]: false }));
  };

  const handleSaveLink = async (pid: string) => {
    const p = packages.find((x: any) => (x.id || x._id) === pid);
    if (!p) return;

    const link = tempLinks[pid]?.trim() ?? "";
    const err = p.status === "scheduled" ? validateUrl(link) : null;
    setLinkErrors((prev) => ({ ...prev, [pid]: err }));
    if (err) return;

    await updatePackage(pid, { meetingLink: link });
    setEditingRows((prev) => ({ ...prev, [pid]: false }));
  };

  if (isLoading) {
    return (
      <div className="package-management-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="package-management-container">
      <div className="page-header">
        <h1 className="page-title">Package Management</h1>
        <p className="page-subtitle">Manage and monitor tutoring packages</p>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-scroll">
          {["all", "requested_assessment", "pending_payment", "approved", "scheduled", "completed", "cancelled", "no-show"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`tab-button ${statusFilter === status ? "active" : ""}`}
              >
                {formatFilterStatus(status)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <span className="stat-number">
              {packages.filter((p: any) => p.status === "scheduled").length}
            </span>
            <span className="stat-label">Scheduled</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-number">
              {packages.filter((p: any) => p.status === "completed").length}
            </span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <span className="stat-number">
              {packages.filter((p: any) => p.status === "pending_payment").length}
            </span>
            <span className="stat-label">Pending Payment</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-number">
              {packages.filter((p: any) => p.status === "requested_assessment").length}
            </span>
            <span className="stat-label">Assessment Requests</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="management-card">
        <div className="card-header">
          <div className="header-content">
            <h2 className="card-title">Tutoring Packages</h2>
            <p className="card-subtitle">Manage all tutoring packages in one place</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary btn-with-icon"
              onClick={() => setShowCreateModal(true)}
            >
              <span className="btn-icon">+</span>
              Create Package
            </button>
            <button 
              className="btn btn-secondary btn-with-icon"
              onClick={getPackages}
            >
              <span className="btn-icon">↻</span>
              Refresh
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="packages-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Teacher</th>
                <th>Subject/Grade</th>
                <th>Date & Time</th>
                <th>Payment Upload</th>
                <th>Price</th>
                <th>Package</th>
                <th>Status</th>
                <th className="meeting-link-column">Meeting Link</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={10} className="empty-state">
                    <div className="empty-content">
                      <div className="empty-icon">📦</div>
                      <h3>No packages found</h3>
                      <p>No packages match your current filters.</p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => setStatusFilter("all")}
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg: any) => {
                  const pid = pkg.id || pkg._id;
                  const linkValue = tempLinks[pid] ?? pkg.meetingLink ?? "";
                  const error = linkErrors[pid] ?? null;
                  const isScheduled = pkg.status === "scheduled";
                  const canEdit = isAdmin && isScheduled;
                  const isEditing = !!editingRows[pid];

                  // Get student name from child object or studentName field
                  const studentName = pkg.child 
                    ? `${pkg.child.firstName || ''} ${pkg.child.lastName || ''}`.trim() 
                    : pkg.studentName || "-";

                  // Get grade from child object or grade field
                  const grade = pkg.child?.gradeLevel || pkg.grade || "-";

                  return (
                    <tr key={pid} className="package-row">
                      <td className="student-cell">
                        <strong>{studentName}</strong>
                      </td>
                      <td className="teacher-cell">
                        {pkg.tutorName || <span className="not-assigned">Not Assigned</span>}
                      </td>
                      <td className="subject-cell">
                        <div className="subject-info">
                          <strong>{pkg.subject || "Assessment"}</strong>
                          {grade && <span className="grade-badge">{grade} Grade</span>}
                        </div>
                      </td>
                      <td className="datetime-cell">
                        <div className="datetime-info">
                          {pkg.date
                            ? new Date(pkg.date).toLocaleDateString()
                            : pkg.preferredDate
                            ? new Date(pkg.preferredDate).toLocaleDateString()
                            : "-"}
                          <br />
                          <small className="time-text">{pkg.time || pkg.preferredTime || "-"}</small>
                        </div>
                      </td>
                      <td className="payment-cell">
                        {pkg.paymentProof ? `${pkg.paymentProof} min` : "-"}
                      </td>
                      <td className="price-cell">
                        {pkg.price ? `₱${pkg.price.toLocaleString()}` : "-"}
                      </td>
                      <td className="package-type-cell">
                        {pkg.packageType ? (
                          <div className="package-type-info">
                            <strong className="package-name">
                              {pkg.packageType === "1-1" ? "1:1 Private" : "1:2 Small Group"}
                            </strong>
                            <small className="package-duration">{pkg.packageDuration} sessions/week</small>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge ${getStatusBadgeClass(pkg.status)}`}>
                          {formatStatusDisplay(pkg.status)}
                        </span>
                        {pkg.paymentStatus && pkg.paymentStatus !== 'verified' && (
                          <div className="payment-status">
                            <small>Payment: {pkg.paymentStatus}</small>
                          </div>
                        )}
                      </td>

                      <td className="meeting-link-cell">
                        <div className="meeting-link-editor">
                          <input
                            type="url"
                            className={`link-input ${error ? "input-error" : ""}`}
                            placeholder={
                              canEdit
                                ? isEditing
                                  ? "https://meet.google.com/..."
                                  : "Click Edit to modify"
                                : "No link available"
                            }
                            value={linkValue}
                            onChange={(e) => handleLinkChange(pid, e.target.value)}
                            disabled={!(canEdit && isEditing)}
                          />
                          {!isEditing ? (
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => handleEdit(pid)}
                              disabled={!canEdit}
                            >
                              Edit
                            </button>
                          ) : (
                            <div className="edit-actions">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleSaveLink(pid)}
                                disabled={!!error}
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => handleCancel(pid)}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {error && <div className="field-error">{error}</div>}
                          {!canEdit && !linkValue && (
                            <div className="link-help">
                              Set status to "Scheduled" to add a link
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="actions-cell">
                        <div className="action-buttons">
                          <select
                            value={pkg.status}
                            onChange={(e) =>
                              handleStatusChange(
                                pid,
                                e.target.value as TutoringPackage["status"]
                              )
                            }
                            className="status-dropdown"
                          >
                            <option value="requested_assessment">Assessment Requested</option>
                            <option value="pending_payment">Pending Payment</option>
                            <option value="approved">Approved</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no-show">No Show</option>
                          </select>
                          <button 
                            className="btn btn-sm btn-outline"
                            onClick={() => openDialog(pkg)}
                          >
                            Details
                          </button>
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

      {/* Create Package Modal */}
      <CreatePackageModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={getPackages}
      />
    </div>
  );
};