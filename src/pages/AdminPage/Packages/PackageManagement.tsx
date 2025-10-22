import React, { useEffect, useState, useContext } from "react";
import { LoadingSpinner } from "../../../components/LoadingSpinner/LoadingSpinner";
import { PackageContext } from "../../../contexts/PackageContext";
import type { TutoringPackage } from "../../../types";
import { CreatePackageModal } from "./CreatePackageModal";
import { pricingData, type PricingData } from "../../../types/pricing";
import "./PackageManagement.css";

// Define types for the component
interface PackageChild {
  firstName?: string;
  lastName?: string;
  gradeLevel?: string;
}

interface PackagePayment {
  fileName?: string;
}

interface Package {
  id?: string;
  _id?: string;
  child?: PackageChild;
  studentName?: string;
  tutorName?: string;
  subject?: string;
  grade?: string;
  date?: string;
  preferredDate?: string;
  time?: string;
  preferredTime?: string;
  paymentProof?: string;
  payment?: PackagePayment;
  price?: number;
  packageType?: "1-1" | "1-2";
  packageDuration?: string;
  status: TutoringPackage["status"];
  paymentStatus?: string;
  meetingLink?: string;
}

interface PackageContextType {
  packages: Package[];
  isLoading: boolean;
  openDialog: (pkg: Package) => void;
  getPackages: () => Promise<void>;
  updatePackage: (id: string, updates: Partial<Package>) => Promise<void>;
}

export const PackageManagement: React.FC = () => {
  const { packages, isLoading, getPackages, updatePackage } = 
    useContext<PackageContextType>(PackageContext as React.Context<PackageContextType>);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tempLinks, setTempLinks] = useState<Record<string, string>>({});
  const [linkErrors, setLinkErrors] = useState<Record<string, string | null>>({});
  const [editingRows, setEditingRows] = useState<Record<string, boolean>>({});
  const [editingPackageRows, setEditingPackageRows] = useState<Record<string, boolean>>({});
  const [editingPriceRows, setEditingPriceRows] = useState<Record<string, boolean>>({});
  const [editingStatusRows, setEditingStatusRows] = useState<Record<string, boolean>>({});
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [updatingPackageId, setUpdatingPackageId] = useState<string | null>(null);
  const [packageTypeUpdates, setPackageTypeUpdates] = useState<Record<string, { type: string; duration: string }>>({});
  const [priceUpdates, setPriceUpdates] = useState<Record<string, string>>({});
  const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>({});


  useEffect(() => {
    getPackages();
  }, []);

  const filteredPackages = packages.filter(
    (pkg: Package) => statusFilter === "all" || pkg.status === statusFilter
  );

  // Function to format status for display
  const formatStatusDisplay = (status: string): string => {
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
  const formatFilterStatus = (status: string): string => {
    switch (status) {
      case "pending_payment":
        return "Pending Payment";
      case "requested_assessment":
        return "Assessment Requested";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusBadgeClass = (status: string): string => {
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

  const validateUrl = (value: string): string | null => {
    if (!value) return null; // Allow empty links now
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

  const handleStatusChange = async (pid: string, newStatus: TutoringPackage["status"]): Promise<void> => {
    setUpdatingPackageId(pid);
    try {
      await updatePackage(pid, { status: newStatus });
      setEditingStatusRows(prev => ({ ...prev, [pid]: false }));
      // Refresh packages to get updated data
      await getPackages();
    } catch (error) {
      console.error("Failed to update package status:", error);
    } finally {
      setUpdatingPackageId(null);
    }
  };

  const handleEditStatus = (pid: string): void => {
    setEditingStatusRows((prev) => ({ ...prev, [pid]: true }));
    const current = packages.find((x: Package) => (x.id || x._id) === pid);
    setStatusUpdates(prev => ({
      ...prev,
      [pid]: current?.status || ''
    }));
  };

  const handleCancelStatusEdit = (pid: string): void => {
    setEditingStatusRows(prev => ({ ...prev, [pid]: false }));
  };

  const handlePackageTypeChange = (pid: string, field: 'type' | 'duration', value: string): void => {
    setPackageTypeUpdates(prev => ({
      ...prev,
      [pid]: {
        ...prev[pid],
        [field]: value
      }
    }));
  };

  const handleEditPackage = (pid: string): void => {
    setEditingPackageRows((prev) => ({ ...prev, [pid]: true }));
    const current = packages.find((x: Package) => (x.id || x._id) === pid);
    setPackageTypeUpdates(prev => ({
      ...prev,
      [pid]: {
        type: current?.packageType || '',
        duration: current?.packageDuration || ''
      }
    }));
  };

  const handleSavePackageType = async (pid: string): Promise<void> => {
    const updates = packageTypeUpdates[pid];
    if (!updates?.type || !updates?.duration) return;

    setUpdatingPackageId(pid);
    try {
      // Get the price from pricing data
      const packageType = updates.type as keyof PricingData;
      const duration = updates.duration;
      const packageInfo = pricingData[packageType]?.plans[duration]?.[0];
      
      const updateData: Partial<Package> = {
        packageType: updates.type as "1-1" | "1-2",
        packageDuration: duration
      };

      // Set price based on package type and duration
      if (packageInfo) {
        const price = parseInt(packageInfo.price.replace(/[^\d]/g, ''));
        updateData.price = price;
      }

      await updatePackage(pid, updateData);
      setPackageTypeUpdates(prev => {
        const newState = { ...prev };
        delete newState[pid];
        return newState;
      });
      setEditingPackageRows(prev => ({ ...prev, [pid]: false }));
      // Refresh packages to get updated data
      await getPackages();
    } catch (error) {
      console.error("Failed to update package type:", error);
    } finally {
      setUpdatingPackageId(null);
    }
  };

  const handleCancelPackageEdit = (pid: string): void => {
    setEditingPackageRows(prev => ({ ...prev, [pid]: false }));
    setPackageTypeUpdates(prev => {
      const newState = { ...prev };
      delete newState[pid];
      return newState;
    });
  };

  const handleEditPrice = (pid: string): void => {
    setEditingPriceRows((prev) => ({ ...prev, [pid]: true }));
    const current = packages.find((x: Package) => (x.id || x._id) === pid);
    setPriceUpdates(prev => ({
      ...prev,
      [pid]: current?.price?.toString() || ''
    }));
  };

  const handlePriceChange = (pid: string, value: string): void => {
    setPriceUpdates(prev => ({
      ...prev,
      [pid]: value
    }));
  };

  const handleSavePrice = async (pid: string): Promise<void> => {
    const priceValue = priceUpdates[pid];
    if (!priceValue) return;

    setUpdatingPackageId(pid);
    try {
      const price = parseInt(priceValue.replace(/[^\d]/g, ''));
      await updatePackage(pid, { price });
      setEditingPriceRows(prev => ({ ...prev, [pid]: false }));
      // Refresh packages to get updated data
      await getPackages();
    } catch (error) {
      console.error("Failed to update price:", error);
    } finally {
      setUpdatingPackageId(null);
    }
  };

  const handleCancelPriceEdit = (pid: string): void => {
    setEditingPriceRows(prev => ({ ...prev, [pid]: false }));
    setPriceUpdates(prev => {
      const newState = { ...prev };
      delete newState[pid];
      return newState;
    });
  };

  const handleLinkChange = (pid: string, value: string): void => {
    setTempLinks((prev) => ({ ...prev, [pid]: value }));
    // Validate URL only if there's a value
    if (value) {
      setLinkErrors((prev) => ({
        ...prev,
        [pid]: validateUrl(value)
      }));
    } else {
      setLinkErrors((prev) => ({ ...prev, [pid]: null }));
    }
  };

  const handleEdit = (pid: string): void => {
    setEditingRows((prev) => ({ ...prev, [pid]: true }));
  };

  const handleCancel = (pid: string): void => {
    const current = packages.find((x: Package) => (x.id || x._id) === pid);
    setTempLinks((prev) => ({ ...prev, [pid]: current?.meetingLink ?? "" }));
    setLinkErrors((prev) => ({ ...prev, [pid]: null }));
    setEditingRows((prev) => ({ ...prev, [pid]: false }));
  };

  const handleSaveLink = async (pid: string): Promise<void> => {
    const p = packages.find((x: Package) => (x.id || x._id) === pid);
    if (!p) return;

    const link = tempLinks[pid]?.trim() ?? "";
    const err = validateUrl(link); // Validate only if there's a value
    
    setLinkErrors((prev) => ({ ...prev, [pid]: err }));
    if (err) return;

    setUpdatingPackageId(pid);
    try {
      await updatePackage(pid, { meetingLink: link });
      setEditingRows((prev) => ({ ...prev, [pid]: false }));
      // Refresh packages to get updated data
      await getPackages();
    } catch (error) {
      console.error("Failed to update meeting link:", error);
    } finally {
      setUpdatingPackageId(null);
    }
  };

  // Get available package durations based on package type
  const getPackageDurations = (packageType: string): string[] => {
    return Object.keys(pricingData[packageType as keyof PricingData]?.plans || {});
  };

  // Get price for display
  const getPackagePrice = (pkg: Package): string => {
    if (pkg.price) {
      return `₱${pkg.price.toLocaleString()}`;
    }
    
    // Try to get price from package type and duration
    if (pkg.packageType && pkg.packageDuration) {
      const packageInfo = pricingData[pkg.packageType as keyof PricingData]?.plans[pkg.packageDuration]?.[0];
      if (packageInfo) {
        return packageInfo.price;
      }
    }
    
    return "-";
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
              {packages.filter((p: Package) => p.status === "scheduled").length}
            </span>
            <span className="stat-label">Scheduled</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-number">
              {packages.filter((p: Package) => p.status === "completed").length}
            </span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <span className="stat-number">
              {packages.filter((p: Package) => p.status === "pending_payment").length}
            </span>
            <span className="stat-label">Pending Payment</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-number">
              {packages.filter((p: Package) => p.status === "requested_assessment").length}
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
                <th>Price</th>
                <th>Package</th>
                <th>Status</th>
                <th className="meeting-link-column">Meeting Link</th>
                <th>Payment Upload</th>
              </tr>
            </thead>

            <tbody>
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-state">
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
                filteredPackages.map((pkg: Package) => {
                  const pid = pkg.id || pkg._id || '';
                  const linkValue = tempLinks[pid] ?? pkg.meetingLink ?? "";
                  const error = linkErrors[pid] ?? null;
                  const isEditingLink = !!editingRows[pid];
                  const isEditingPackage = !!editingPackageRows[pid];
                  const isEditingPrice = !!editingPriceRows[pid];
                  const isEditingStatus = !!editingStatusRows[pid];
                  const isUpdating = updatingPackageId === pid;
                  const packageUpdate = packageTypeUpdates[pid] || { type: pkg.packageType || '', duration: pkg.packageDuration || '' };
                  const priceValue = priceUpdates[pid] || pkg.price?.toString() || '';
                  const statusValue = statusUpdates[pid] || pkg.status || '';

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
                      <td className="price-cell">
                        {!isEditingPrice ? (
                          <div className="price-display">
                            <strong>{getPackagePrice(pkg)}</strong>
                            <button
                              className="btn btn-sm btn-outline price-edit-btn"
                              onClick={() => handleEditPrice(pid)}
                              disabled={isUpdating}
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <div className="price-editor">
                            <input
                              type="text"
                              className="price-input"
                              placeholder="Enter price"
                              value={priceValue}
                              onChange={(e) => handlePriceChange(pid, e.target.value)}
                              disabled={isUpdating}
                            />
                            <div className="price-edit-actions">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleSavePrice(pid)}
                                disabled={isUpdating || !priceValue}
                              >
                                {isUpdating ? "Saving..." : "Save"}
                              </button>
                              <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => handleCancelPriceEdit(pid)}
                                disabled={isUpdating}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="package-type-cell">
                        {!isEditingPackage ? (
                          <div className="package-type-display">
                            <div className="package-type-info">
                              <strong className="package-name">
                                {pkg.packageType === "1-1" ? "1:1 Private" : 
                                 pkg.packageType === "1-2" ? "1:2 Small Group" : 
                                 "Not Set"}
                              </strong>
                              {pkg.packageDuration && (
                                <small className="package-duration">{pkg.packageDuration} sessions/week</small>
                              )}
                            </div>
                            <button
                              className="btn btn-sm btn-outline package-edit-btn"
                              onClick={() => handleEditPackage(pid)}
                              disabled={isUpdating}
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <div className="package-type-editor">
                            <div className="package-selectors">
                              <select
                                value={packageUpdate.type}
                                onChange={(e) => handlePackageTypeChange(pid, 'type', e.target.value)}
                                className="package-type-dropdown"
                                disabled={isUpdating}
                              >
                                <option value="">Select Package Type</option>
                                <option value="1-1">1:1 Private</option>
                                <option value="1-2">1:2 Small Group</option>
                              </select>
                              
                              {packageUpdate.type && (
                                <select
                                  value={packageUpdate.duration}
                                  onChange={(e) => handlePackageTypeChange(pid, 'duration', e.target.value)}
                                  className="package-duration-dropdown"
                                  disabled={isUpdating}
                                >
                                  <option value="">Select Duration</option>
                                  {getPackageDurations(packageUpdate.type).map(duration => (
                                    <option key={duration} value={duration}>
                                      {duration} sessions/week
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                            {packageUpdate.type && packageUpdate.duration && (
                              <div className="package-price-preview">
                                <small>
                                  Price: {pricingData[packageUpdate.type as keyof PricingData]?.plans[packageUpdate.duration]?.[0]?.price}
                                </small>
                              </div>
                            )}
                            <div className="package-edit-actions">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleSavePackageType(pid)}
                                disabled={isUpdating || !packageUpdate.type || !packageUpdate.duration}
                              >
                                {isUpdating ? "Saving..." : "Save"}
                              </button>
                              <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => handleCancelPackageEdit(pid)}
                                disabled={isUpdating}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="status-cell">
                        {!isEditingStatus ? (
                          <div className="status-display">
                            <span className={`status-badge ${getStatusBadgeClass(pkg.status)}`}>
                              {formatStatusDisplay(pkg.status)}
                            </span>
                            {pkg.paymentStatus && pkg.paymentStatus !== 'verified' && (
                              <div className="payment-status">
                                <small>Payment: {pkg.paymentStatus}</small>
                              </div>
                            )}
                            <button
                              className="btn btn-sm btn-outline status-edit-btn"
                              onClick={() => handleEditStatus(pid)}
                              disabled={isUpdating}
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <div className="status-editor">
                            <select
                              value={statusValue}
                              onChange={(e) => setStatusUpdates(prev => ({ ...prev, [pid]: e.target.value }))}
                              className="status-dropdown"
                              disabled={isUpdating}
                            >
                              <option value="requested_assessment">Assessment Requested</option>
                              <option value="pending_payment">Pending Payment</option>
                              <option value="approved">Approved</option>
                              <option value="scheduled">Scheduled</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="no-show">No Show</option>
                            </select>
                            <div className="status-edit-actions">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleStatusChange(pid, statusValue as TutoringPackage["status"])}
                                disabled={isUpdating}
                              >
                                {isUpdating ? "Saving..." : "Save"}
                              </button>
                              <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => handleCancelStatusEdit(pid)}
                                disabled={isUpdating}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="meeting-link-cell">
                        <div className="meeting-link-editor">
                          <input
                            type="url"
                            className={`link-input ${error ? "input-error" : ""}`}
                            placeholder={
                              isEditingLink
                                ? "https://meet.google.com/..."
                                : "Click Edit to add/modify link"
                            }
                            value={linkValue}
                            onChange={(e) => handleLinkChange(pid, e.target.value)}
                            disabled={!isEditingLink || isUpdating}
                          />
                          {!isEditingLink ? (
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => handleEdit(pid)}
                              disabled={isUpdating}
                            >
                              {isUpdating ? "Updating..." : "Edit"}
                            </button>
                          ) : (
                            <div className="edit-actions">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleSaveLink(pid)}
                                disabled={!!error || isUpdating}
                              >
                                {isUpdating ? "Saving..." : "Save"}
                              </button>
                              <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => handleCancel(pid)}
                                disabled={isUpdating}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {error && <div className="field-error">{error}</div>}
                        </div>
                      </td>

                      <td className="payment-cell">
                        {pkg.paymentProof ? (
                          <div className="payment-proof-info">
                            <a 
                              href={pkg.paymentProof} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline payment-link"
                            >
                              View Proof
                            </a>
                            {pkg.payment?.fileName && (
                              <small className="file-name">{pkg.payment.fileName}</small>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
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