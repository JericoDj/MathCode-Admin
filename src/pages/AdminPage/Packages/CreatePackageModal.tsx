import React, { useState, useContext, useEffect } from "react";
import { PackageContext } from "../../../contexts/PackageContext";
import type { TutoringPackage } from "../../../types";
import { pricingData, type PricingData } from "../../../types/pricing";
import { useUser } from "../../../contexts/UserContext";
import "./CreatePackageModal.css";

interface CreatePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  school?: string;
  gradeLevel?: string;
  guardians: string[];
  profile?: {
    timezone: string;
    address?: string;
  };
}

interface Parent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profile?: {
    timezone: string;
  };
  credits?: number; // Added credits field
}

interface PreferredTime {
  day: string;
  time: string;
}

export const CreatePackageModal: React.FC<CreatePackageModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const { addCredits, getUser } = useUser();
  const { createPackage } = useContext(PackageContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingParents, setIsLoadingParents] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    childId: "",
    parentId: "",
    tutorName: "",
    subject: "",
    preferredDate: "",
    timezone: "Asia/Manila",
    price: 0,
    status: "pending_payment" as TutoringPackage["status"],
    packageType: "",
    sessionsPerWeek: "",
    planDuration: "MONTHLY",
    sessionsCount: 0,
    credits: 0,
    notes: "",
    preferredDays: [] as string[],
    preferredTimes: [] as PreferredTime[]
  });

  // Days of the week for selection
  const daysOfWeek = [
    "Monday",
    "Tuesday", 
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  // Time slots
  const timeSlots = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"
  ];

  // Load students and parents on modal open
  useEffect(() => {
    if (isOpen) {
      loadStudents();
      loadParents();
      setError(null); // Reset error when modal opens
    }
  }, [isOpen]);

  const loadStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No token found in localStorage');
        setIsLoadingStudents(false);
        return;
      }

      const response = await fetch('http://localhost:4000/api/students/role/student', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Students response status:', response.status);
      
      if (response.ok) {
        const studentsData = await response.json();
        setStudents(studentsData);
      } else {
        console.error('Failed to load students. Status:', response.status);
        const errorData = await response.json().catch(() => ({ message: 'Failed to load students' }));
        setError(errorData.message);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setError('Failed to load students. Please try again.');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const loadParents = async () => {
    setIsLoadingParents(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No token found in localStorage');
        setIsLoadingParents(false);
        return;
      }

      const response = await fetch('http://localhost:4000/api/students/role/parent', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Parents response status:', response.status);
      
      if (response.ok) {
        const parentsData = await response.json();
        setParents(parentsData);
      } else {
        console.error('Failed to load parents. Status:', response.status);
        const errorData = await response.json().catch(() => ({ message: 'Failed to load parents' }));
        setError(errorData.message);
      }
    } catch (error) {
      console.error('Error loading parents:', error);
      setError('Failed to load parents. Please try again.');
    } finally {
      setIsLoadingParents(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePackageTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const packageType = e.target.value;
    setFormData(prev => ({
      ...prev,
      packageType,
      sessionsPerWeek: "",
      price: 0,
      sessionsCount: 0,
      credits: 0,
      preferredDays: [],
      preferredTimes: []
    }));
  };

  const handleSessionsPerWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sessionsPerWeek = e.target.value;
    
    if (formData.packageType && sessionsPerWeek) {
      const packageInfo = pricingData[formData.packageType as keyof PricingData];
      
      if (packageInfo) {
        const plan = packageInfo.plans[sessionsPerWeek]?.[0];
        if (plan) {
          const priceMatch = plan.price.match(/₱([\d,]+)/);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;
          const sessionsMatch = plan.sessions.match(/(\d+)/);
          const sessionsCount = sessionsMatch ? parseInt(sessionsMatch[1]) : 0;
          const credits = parseInt(plan.credits) || 0;
          
          setFormData(prev => ({
            ...prev,
            sessionsPerWeek,
            price,
            sessionsCount,
            credits,
            preferredDays: [],
            preferredTimes: []
          }));
          return;
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      sessionsPerWeek,
      price: 0,
      sessionsCount: 0,
      credits: 0,
      preferredDays: [],
      preferredTimes: []
    }));
  };

  const handlePlanDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const planDuration = e.target.value;
    
    if (formData.packageType && formData.sessionsPerWeek && planDuration) {
      const packageInfo = pricingData[formData.packageType as keyof PricingData];
      
      if (packageInfo) {
        const plans = packageInfo.plans[formData.sessionsPerWeek];
        const selectedPlan = plans.find(plan => plan.duration === planDuration);
        
        if (selectedPlan) {
          const priceMatch = selectedPlan.price.match(/₱([\d,]+)/);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;
          const sessionsMatch = selectedPlan.sessions.match(/(\d+)/);
          const sessionsCount = sessionsMatch ? parseInt(sessionsMatch[1]) : 0;
          const credits = parseInt(selectedPlan.credits) || 0;
          
          setFormData(prev => ({
            ...prev,
            planDuration,
            price,
            sessionsCount,
            credits
          }));
          return;
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      planDuration,
      price: 0,
      sessionsCount: 0,
      credits: 0
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => {
      const currentDays = prev.preferredDays;
      const currentTimes = prev.preferredTimes;
      const maxDays = parseInt(prev.sessionsPerWeek) || 0;
      
      if (currentDays.includes(day)) {
        const newDays = currentDays.filter(d => d !== day);
        const newTimes = currentTimes.filter(t => t.day !== day);
        return { 
          ...prev, 
          preferredDays: newDays,
          preferredTimes: newTimes
        };
      }
      
      if (currentDays.length >= maxDays) {
        return prev;
      }
      
      const newDays = [...currentDays, day];
      const newTimes = [...currentTimes, { day, time: "" }];
      
      return { 
        ...prev, 
        preferredDays: newDays,
        preferredTimes: newTimes
      };
    });
  };

  const handleTimeChange = (day: string, time: string) => {
    setFormData(prev => {
      const currentTimes = prev.preferredTimes;
      const existingTimeIndex = currentTimes.findIndex(t => t.day === day);
      
      if (existingTimeIndex >= 0) {
        const newTimes = [...currentTimes];
        newTimes[existingTimeIndex] = { day, time };
        return { ...prev, preferredTimes: newTimes };
      } else {
        const newTimes = [...currentTimes, { day, time }];
        return { ...prev, preferredTimes: newTimes };
      }
    });
  };

  const getTimeForDay = (day: string): string => {
    const timeEntry = formData.preferredTimes.find(t => t.day === day);
    return timeEntry?.time || "";
  };

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const getSelectedStudent = () => {
    return students.find(student => student._id === formData.childId);
  };

  const getSelectedParent = () => {
    return parents.find(parent => parent._id === formData.parentId);
  };

  const getSelectedPackageInfo = () => {
    if (!formData.packageType || !formData.sessionsPerWeek || !formData.planDuration) return null;
    
    const packageInfo = pricingData[formData.packageType as keyof PricingData];
    const plans = packageInfo?.plans[formData.sessionsPerWeek];
    return plans?.find(plan => plan.duration === formData.planDuration) || null;
  };

  const areAllTimesSelected = (): boolean => {
    return formData.preferredTimes.every(time => time.time !== "");
  };

  const formatPreferredTimes = (): string => {
    return formData.preferredTimes
      .map(time => `${time.day}: ${time.time}`)
      .join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);
  
  try {
    let creditsAdded = false;
    let packageCreated = false;
    let currentCredits = 0;

    try {
      // Step 1: Add credits to the parent FIRST if credits are greater than 0
      if (formData.credits > 0 && formData.parentId) {
        try {
          // Get current parent info first to show what we're updating from
          const currentParent = await getUser(formData.parentId);
          currentCredits = currentParent.credits || 0;
          
          console.log(`Adding ${formData.credits} credits to parent. Current: ${currentCredits}, New total: ${currentCredits + formData.credits}`);
          
          // Add the credits (this will get current credits and add to them)
          await addCredits(formData.parentId, formData.credits);
          creditsAdded = true;
          
          console.log(`Successfully added ${formData.credits} credits to parent. New total: ${currentCredits + formData.credits}`);
        } catch (creditsError) {
          console.error('Failed to add credits to parent:', creditsError);
          throw new Error(`Failed to add credits: ${creditsError instanceof Error ? creditsError.message : 'Unknown error'}`);
        }
      }

      // Step 2: Create the package AFTER credits are added
      const submitData = {
        // Student/Parent Information
        childId: formData.childId,
        requestedBy: formData.parentId,
        
        // Child information (from selected student)
        child: getSelectedStudent() ? {
          firstName: getSelectedStudent()!.firstName,
          lastName: getSelectedStudent()!.lastName,
          gradeLevel: getSelectedStudent()!.gradeLevel,
          school: getSelectedStudent()!.school,
          email: getSelectedStudent()!.email,
          phone: getSelectedStudent()!.phone,
          age: ""
        } : undefined,
        
        // Session scheduling
        preferredDate: formData.preferredDate,
        preferredTime: formatPreferredTimes(),
        timezone: formData.timezone,
        notes: formData.notes,
        
        // Package information
        packageType: formData.packageType,
        sessionsPerWeek: formData.sessionsPerWeek,
        planDuration: formData.planDuration,
        price: formData.price,
        totalSessions: formData.sessionsCount,
        remainingSessions: formData.sessionsCount,
        
        // Credits system
        credits: formData.credits,
        
        // Status
        status: formData.status,
        paymentStatus: formData.status === 'pending_payment' ? 'pending' : 'under_review',
        
        // Additional fields
        subject: formData.subject,
        grade: getSelectedStudent()?.gradeLevel,
        
        // Payment proof file
        paymentProof: paymentProof
      };

      await createPackage(submitData);
      packageCreated = true;
      console.log('Package created successfully');
      
      // Show success message based on what was accomplished
      if (packageCreated && creditsAdded) {
        console.log('Package created and credits added successfully');
      } else if (packageCreated) {
        console.log('Package created successfully (no credits to add)');
      }
      
      onCreate();
      onClose();
      
      // Reset form
      setFormData({
        childId: "",
        parentId: "",
        tutorName: "",
        subject: "",
        preferredDate: "",
        timezone: "Asia/Manila",
        price: 0,
        status: "pending_payment",
        packageType: "",
        sessionsPerWeek: "",
        planDuration: "MONTHLY",
        sessionsCount: 0,
        credits: 0,
        notes: "",
        preferredDays: [],
        preferredTimes: []
      });
      setPaymentProof(null);
      
    } catch (error) {
      console.error("Failed to process package creation:", error);
      
      // ROLLBACK: If credits were added but package creation failed, remove the credits
      if (creditsAdded && formData.parentId) {
        try {
          console.log(`Rolling back credits due to package creation failure. Removing ${formData.credits} credits`);
          // Subtract the credits we just added
          await addCredits(formData.parentId, -formData.credits);
          console.log('Credits successfully rolled back');
        } catch (rollbackError) {
          console.error('Failed to rollback credits:', rollbackError);
          setError(`Package creation failed and could not rollback credits. Please contact support. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      // Set the appropriate error message
      if (creditsAdded) {
        setError(`Package creation failed. Credits were added but then rolled back. Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } else {
        setError(error instanceof Error ? error.message : "Failed to create package. Please try again.");
      }
    }
    
  } catch (error) {
    console.error("Unexpected error in package creation:", error);
    setError("An unexpected error occurred. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  if (!isOpen) return null;

  const selectedStudent = getSelectedStudent();
  const selectedParent = getSelectedParent();
  const selectedPackageInfo = getSelectedPackageInfo();
  const maxDays = parseInt(formData.sessionsPerWeek) || 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-package-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Package</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            <span className="error-message">{error}</span>
            <button className="error-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Student & Parent Selection Section */}
          <div className="form-section">
            <h3 className="section-title">Select Student & Parent</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Student *</label>
                {isLoadingStudents ? (
                  <div className="loading-text">Loading students...</div>
                ) : (
                  <select
                    className="form-select"
                    value={formData.childId}
                    onChange={(e) => handleInputChange("childId", e.target.value)}
                    required
                  >
                    <option value="">Select a student</option>
                    {students.map(student => (
                      <option key={student._id} value={student._id}>
                        {student.firstName} {student.lastName} - {student.gradeLevel || 'No Grade'} - {student.school || 'No School'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Parent Account *</label>
                {isLoadingParents ? (
                  <div className="loading-text">Loading parents...</div>
                ) : (
                  <select
                    className="form-select"
                    value={formData.parentId}
                    onChange={(e) => handleInputChange("parentId", e.target.value)}
                    required
                  >
                    <option value="">Select a parent</option>
                    {parents.map(parent => (
                      <option key={parent._id} value={parent._id}>
                        {parent.firstName} {parent.lastName} - {parent.email} - {parent.phone}
                        {parent.credits !== undefined && ` - Credits: ${parent.credits}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Student Information Display */}
            {selectedStudent && (
              <div className="student-info-card">
                <h4 className="info-title">Student Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedStudent.firstName} {selectedStudent.lastName}</span>
                  </div>
                  <div className="info-item">
                    <label>Grade Level:</label>
                    <span>{selectedStudent.gradeLevel || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>School:</label>
                    <span>{selectedStudent.school || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedStudent.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <span>{selectedStudent.phone}</span>
                  </div>
                  <div className="info-item">
                    <label>Address:</label>
                    <span>{selectedStudent.address || selectedStudent.profile?.address || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Parent Information Display */}
            {selectedParent && (
  <div className="student-info-card">
    <h4 className="info-title">Parent Information</h4>
    <div className="info-grid">
      <div className="info-item">
        <label>Name:</label>
        <span>{selectedParent.firstName} {selectedParent.lastName}</span>
      </div>
      <div className="info-item">
        <label>Email:</label>
        <span>{selectedParent.email}</span>
      </div>
      <div className="info-item">
        <label>Phone:</label>
        <span>{selectedParent.phone}</span>
      </div>
      <div className="info-item">
        <label>Current Credits:</label>
        <span className="current-credits">{selectedParent.credits !== undefined ? selectedParent.credits : 'Loading...'}</span>
      </div>
      <div className="info-item">
        <label>Credits to Add:</label>
        <span className="credits-to-add">+{formData.credits}</span>
      </div>
      <div className="info-item">
        <label>New Total Credits:</label>
        <span className="credits-total">
          {selectedParent.credits !== undefined ? selectedParent.credits + formData.credits : formData.credits}
        </span>
      </div>
    </div>
  </div>
)}
          </div>

          {/* Package Details Section */}
          <div className="form-section">
            <h3 className="section-title">Package Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Package Type *</label>
                <select
                  className="form-select"
                  value={formData.packageType}
                  onChange={handlePackageTypeChange}
                  required
                >
                  <option value="">Select Package Type</option>
                  <option value="1-1">1:1 Private Tutoring</option>
                  <option value="1-2">1:2 Small Group</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Sessions Per Week *</label>
                <select
                  className="form-select"
                  value={formData.sessionsPerWeek}
                  onChange={handleSessionsPerWeekChange}
                  required
                  disabled={!formData.packageType}
                >
                  <option value="">Select Frequency</option>
                  <option value="2">2 sessions/week</option>
                  <option value="3">3 sessions/week</option>
                  <option value="5">5 sessions/week</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Plan Duration *</label>
                <select
                  className="form-select"
                  value={formData.planDuration}
                  onChange={handlePlanDurationChange}
                  required
                  disabled={!formData.packageType || !formData.sessionsPerWeek}
                >
                  <option value="">Select Duration</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="SEMI-ANNUAL">Semi-Annual</option>
                  <option value="ANNUAL">Annual</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Total Price</label>
                <div className="price-display-large">
                  {selectedPackageInfo ? (
                    <>
                      <strong>{selectedPackageInfo.price}</strong>
                      <small className="price-details">
                        {selectedPackageInfo.sessions} • {selectedPackageInfo.perSession}
                      </small>
                      <div className="credits-info">
                        <small>Credits to add: {formData.credits}</small>
                      </div>
                    </>
                  ) : (
                    <span className="price-placeholder">Select package type, frequency and duration</span>
                  )}
                </div>
              </div>
            </div>

            {/* Package Features Display */}
            {selectedPackageInfo && (
              <div className="package-features">
                <h4 className="features-title">Package Includes:</h4>
                <ul className="features-list">
                  {selectedPackageInfo.features.map((feature, index) => (
                    <li key={index} className="feature-item">{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Rest of your form sections remain the same */}
          {/* Session Scheduling Section */}
          <div className="form-section">
            <h3 className="section-title">Session Scheduling</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Starting Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Preferred Days and Times Selection */}
            <div className="form-group">
              <label className="form-label">
                Preferred Days & Times ({formData.preferredDays.length}/{maxDays} selected)
                {maxDays > 0 && (
                  <small className="days-help">Select {maxDays} days and set preferred times for each</small>
                )}
              </label>
              
              {/* Days Selection */}
              <div className="days-selection" style={{ marginBottom: '1.5rem' }}>
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    className={`day-button ${
                      formData.preferredDays.includes(day) ? 'selected' : ''
                    } ${
                      formData.preferredDays.length >= maxDays && !formData.preferredDays.includes(day) ? 'disabled' : ''
                    }`}
                    onClick={() => handleDayToggle(day)}
                    disabled={formData.preferredDays.length >= maxDays && !formData.preferredDays.includes(day)}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>

              {/* Times Selection for Selected Days */}
              {formData.preferredDays.length > 0 && (
                <div className="times-selection">
                  <h4 className="times-title">Set Preferred Times:</h4>
                  <div className="times-grid">
                    {formData.preferredDays.map(day => (
                      <div key={day} className="time-selection-group">
                        <label className="time-label">{day}</label>
                        <select
                          className="form-select time-select"
                          value={getTimeForDay(day)}
                          onChange={(e) => handleTimeChange(day, e.target.value)}
                          required
                        >
                          <option value="">Select Time</option>
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="form-section">
            <h3 className="section-title">Additional Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="e.g., Math, Science, English"
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
              <div className="form-group full-width">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any additional notes or special requirements..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Status and Payment Section */}
          <div className="form-section">
            <h3 className="section-title">Status & Payment</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  <option value="pending_payment">Pending Payment</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="approved">Approved</option>
                </select>
              </div>

              {/* Payment Proof Upload for scheduled/approved status */}
              {(formData.status === 'scheduled' || formData.status === 'approved') && (
                <div className="form-group">
                  <label className="form-label">Payment Proof</label>
                  <input
                    type="file"
                    className="form-input"
                    accept="image/*,.pdf"
                    onChange={handlePaymentProofChange}
                  />
                  <small className="form-help">
                    Upload payment proof (image or PDF)
                  </small>
                </div>
              )}
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
              disabled={
                isSubmitting || 
                !formData.childId || 
                !formData.parentId ||
                !formData.subject || 
                !formData.preferredDate || 
                !formData.packageType || 
                !formData.sessionsPerWeek ||
                !formData.planDuration ||
                formData.preferredDays.length !== maxDays ||
                !areAllTimesSelected()
              }
            >
              {isSubmitting ? "Creating Package..." : "Create Package & Add Credits"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};