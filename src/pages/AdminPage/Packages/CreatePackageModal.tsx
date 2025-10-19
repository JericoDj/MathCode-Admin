import React, { useState, useContext } from "react";
import { PackageContext } from "../../../contexts/PackageContext";
import type { TutoringPackage } from "../../../types";

interface CreatePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
}

// Pricing data structure
const pricingData = {
  "1-2": {
    name: "1:2 Small Group",
    description: "Interactive learning with 1 teacher and 2 students",
    plans: {
      "2": [
        {
          duration: "MONTHLY",
          price: "₱5,200",
          sessions: "8 sessions",
          perSession: "₱650/session",
          features: ["1:2 teacher ratio", "8 sessions per month", "Interactive group learning", "Progress tracking"]
        }
      ],
      "3": [
        {
          duration: "MONTHLY",
          price: "₱7,800",
          sessions: "12 sessions",
          perSession: "₱650/session",
          features: ["1:2 teacher ratio", "12 sessions per month", "Interactive group learning", "Progress tracking"]
        }
      ],
      "5": [
        {
          duration: "MONTHLY",
          price: "₱13,000",
          sessions: "20 sessions",
          perSession: "₱650/session",
          features: ["1:2 teacher ratio", "20 sessions per month", "Interactive group learning", "Progress tracking"]
        }
      ]
    }
  },
  "1-1": {
    name: "1:1 Private",
    description: "Personalized one-on-one tutoring sessions",
    plans: {
      "2": [
        {
          duration: "MONTHLY",
          price: "₱9,600",
          sessions: "8 sessions",
          perSession: "₱1,200/session",
          features: ["1:1 teacher ratio", "8 sessions per month", "Personalized curriculum", "Flexible scheduling"]
        }
      ],
      "3": [
        {
          duration: "MONTHLY",
          price: "₱14,400",
          sessions: "12 sessions",
          perSession: "₱1,200/session",
          features: ["1:1 teacher ratio", "12 sessions per month", "Personalized curriculum", "Flexible scheduling"]
        }
      ],
      "5": [
        {
          duration: "MONTHLY",
          price: "₱24,000",
          sessions: "20 sessions",
          perSession: "₱1,200/session",
          features: ["1:1 teacher ratio", "20 sessions per month", "Personalized curriculum", "Flexible scheduling"]
        }
      ]
    }
  }
};

export const CreatePackageModal: React.FC<CreatePackageModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const { createPackage } = useContext(PackageContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentName: "",
    tutorName: "",
    subject: "",
    grade: "",
    date: "",
    time: "",
    duration: 60,
    price: 0,
    status: "scheduled" as TutoringPackage["status"],
    packageType: "",
    packageDuration: "",
    sessionsCount: 0
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePackageChange = (packageType: string, duration: string) => {
    const packageInfo = pricingData[packageType as keyof typeof pricingData];
    
    const validDurations = ['2', '3', '5'] as const;
    if (packageInfo && validDurations.includes(duration as any)) {
      const plan = packageInfo.plans[duration as '2' | '3' | '5'][0];
      const priceMatch = plan.price.match(/₱([\d,]+)/);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;
      const sessionsMatch = plan.sessions.match(/(\d+)/);
      const sessionsCount = sessionsMatch ? parseInt(sessionsMatch[1]) : 0;
      
      setFormData(prev => ({
        ...prev,
        packageType,
        packageDuration: duration,
        price,
        sessionsCount
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createPackage(formData);
      onCreate();
      onClose();
      // Reset form
      setFormData({
        studentName: "",
        tutorName: "",
        subject: "",
        grade: "",
        date: "",
        time: "",
        duration: 60,
        price: 0,
        status: "scheduled",
        packageType: "",
        packageDuration: "",
        sessionsCount: 0
      });
    } catch (error) {
      console.error("Failed to create package:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-package-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Package</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3 className="section-title">Student Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Student Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.studentName}
                  onChange={(e) => handleInputChange("studentName", e.target.value)}
                  placeholder="Enter student name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Grade Level</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.grade}
                  onChange={(e) => handleInputChange("grade", e.target.value)}
                  placeholder="e.g., 3rd Grade"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Package Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Package Type</label>
                <select
                  className="form-select"
                  value={formData.packageType}
                  onChange={(e) => handlePackageChange(e.target.value, formData.packageDuration)}
                >
                  <option value="">Select Package Type</option>
                  <option value="1-1">1:1 Private Tutoring</option>
                  <option value="1-2">1:2 Small Group</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Sessions Per Week</label>
                <select
                  className="form-select"
                  value={formData.packageDuration}
                  onChange={(e) => handlePackageChange(formData.packageType, e.target.value)}
                >
                  <option value="">Select Frequency</option>
                  <option value="2">2 sessions/week</option>
                  <option value="3">3 sessions/week</option>
                  <option value="5">5 sessions/week</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Session Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="e.g., Math, Science"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Teacher Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.tutorName}
                  onChange={(e) => handleInputChange("tutorName", e.target.value)}
                  placeholder="Enter teacher name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Session Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Session Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", parseInt(e.target.value))}
                  min="30"
                  step="15"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price (₱)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", parseInt(e.target.value))}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
              >
                <option value="scheduled">Scheduled</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !formData.studentName || !formData.subject || !formData.date || !formData.time}
            >
              {isSubmitting ? "Creating..." : "Create Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};