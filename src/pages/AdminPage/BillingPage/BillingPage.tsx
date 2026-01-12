import React, { useState } from "react";
import { useBilling } from "../../../contexts/BillingContext";
import type { Billing } from "../../../types/Billing";
import "./BillingPage.css";
import { useUser } from "../../../contexts/UserContext";

export const BillingPage: React.FC = () => {
  const {
    billings,

    updateBillingStatus,
    deleteBilling,
    fetchBillings,
    createBilling,
  } = useBilling();

  const { users } = useUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Parents only
  const parents = users.filter((u) => u.roles?.includes("parent"));

  const [form, setForm] = useState({
    userId: "",
    childName: "",
    package: "",
    amount: 0,
    dueDate: "",
    description: "",
  });

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = billings.length + 1;
    return `INV-${year}-${String(count).padStart(4, "0")}`;
  };

  const handleCreateBilling = async (e: React.FormEvent) => {
    e.preventDefault();

    const parent = parents.find((p) => p._id === form.userId);
    if (!parent) return;

    const payload = {
      userId: form.userId,
      userName: `${parent.firstName} ${parent.lastName}`,
      childName: form.childName || undefined,
      package: form.package,
      amount: Number(form.amount),
      currency: "PHP",
      status: "pending" as const,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      description: form.description || undefined,
      invoiceNumber: generateInvoiceNumber(),
    };

    console.log("📤 Billing Payload Sent:", payload);

    await createBilling(payload);

    setShowCreateModal(false);

    setForm({
      userId: "",
      childName: "",
      package: "",
      amount: 0,
      dueDate: "",
      description: "",
    });
  };

  const filteredBillings = billings.filter((b: Billing) => {
    const term = searchTerm.toLowerCase();

    return (
      (b.userName?.toLowerCase() ?? "").includes(term) ||
      (b.childName?.toLowerCase() ?? "").includes(term) ||
      (b.invoiceNumber?.toLowerCase() ?? "").includes(term)
    ) && (statusFilter === "all" || b.status === statusFilter);
  });

  return (
    <div className="billing-management">
      <div className="page-header">
        <h1>Billing Management</h1>
        <p>Manage invoices and billing for students & parents</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Billings ({filteredBillings.length})</h2>

          <div className="controls">
            <input
              type="text"
              placeholder="Search billing..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button className="btn btn-secondary" onClick={fetchBillings}>
              Refresh
            </button>

            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Billing
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Child</th>
                <th>Package</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
                <th>Due</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBillings.map((b: Billing) => (
                <tr key={b._id}>
                  <td><strong>{b.userName}</strong></td>
                  <td>{b.childName ?? "—"}</td>
                  <td>{b.package}</td>
                  <td>{b.amount} {b.currency}</td>
                  <td><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                  <td>{b.invoiceNumber ?? "—"}</td>
                  <td>{b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "—"}</td>
                  <td className="billing-actions">
                    <select
                      value={b.status}
                      onChange={(e) => updateBillingStatus(b._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button className="btn btn-danger btn-sm" onClick={() => deleteBilling(b._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBillings.length === 0 && (
            <div className="empty-state">
              <p>No billings found yet. Create one!</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Billing</h3>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateBilling} className="modal-form">
              <div className="form-group">
                <label>Parent *</label>
                <select
                  required
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                >
                  <option value="">Select parent...</option>
                  {parents.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Child Name</label>
                <input
                  type="text"
                  value={form.childName}
                  onChange={(e) => setForm({ ...form, childName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Package *</label>
                <input
                  type="text"
                  required
                  value={form.package}
                  onChange={(e) => setForm({ ...form, package: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Amount (PHP) *</label>
                <input
                  type="number"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Billing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
