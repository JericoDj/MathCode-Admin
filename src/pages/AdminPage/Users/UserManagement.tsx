import React, { useState, useEffect } from 'react';
import type { User, CreateUserDTO, UpdateUserDTO } from '../../../types';
import { adminAPI } from '../../../utils/auth.api.tsx';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';

import './UserManagement.css';

// Extended interface for users with populated guardian data
interface UserWithGuardians extends User {
  guardiansDetails?: User[];
  guardianOfDetails?: User[];
}

export const UserManagement: React.FC = () => {
  const [students, setStudents] = useState<UserWithGuardians[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'students' | 'parents' | 'admins'>('students');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showLinkParent, setShowLinkParent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  // Form states
  const [newStudent, setNewStudent] = useState<CreateUserDTO>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roles: ['student'],
    status: 'active',
    profile: {
      timezone: 'Asia/Manila'
    }
  });

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      setIsLoading(true);
      console.log('Starting to load all users...');
      
      const [studentsData, parentsData, adminsData] = await Promise.all([
        adminAPI.getUsersByRole('student'),
        adminAPI.getUsersByRole('parent'),
        adminAPI.getUsersByRole('admin')
      ]);
      
      console.log('Raw data loaded:', {
        studentsCount: studentsData.length,
        parentsCount: parentsData.length,
        students: studentsData,
        parents: parentsData
      });
      
      // Load updated student details with guardian information
      const studentsWithGuardians = await Promise.all(
        studentsData.map(async (student) => {
          try {
            console.log(`Processing student: ${student.firstName} ${student.lastName} (${student.id})`);
            console.log('Student original guardians:', student.guardians);
            
            const updatedStudent = await adminAPI.getUpdatedStudentDetails(student.id);
            console.log('Updated student response:', updatedStudent);
            
            let guardianDetails: User[] = [];
            
            // If the student has guardians, fetch their details
            if (updatedStudent.guardians && updatedStudent.guardians.length > 0) {
              console.log('Found guardians in updated student:', updatedStudent.guardians);
              
              // Fetch details for the first guardian
              const updatedParent = await adminAPI.getParentDetails(updatedStudent.guardians[0]);
              console.log('Parent details fetched:', updatedParent);
              
              // Transform the parent response to User type
              if (updatedParent) {
                console.log('Creating guardian object from parent data');
                guardianDetails = [{
                  id: updatedParent.id,
                  firstName: updatedParent.firstName,
                  lastName: updatedParent.lastName,
                  email: updatedParent.email,
                  phone: updatedParent.phone, 
                  roles: updatedParent.roles,
                  status: updatedParent.status,
                  profile: updatedParent.profile || {},
                  guardianOf: updatedParent.guardianOf || [],
                  guardians: updatedParent.guardians || [],
                  createdAt: updatedParent.createdAt || '',
                  updatedAt: updatedParent.updatedAt || '',
                  fullName: updatedParent.fullName || `${updatedParent.firstName} ${updatedParent.lastName}`.trim()
                }];
              }
            } else {
              console.log('No guardians found in updated student data');
            }
            
            console.log(`Final guardian details for ${student.firstName}:`, guardianDetails);
            
            return {
              ...student,
              guardiansDetails: guardianDetails
            };
          } catch (error) {
            console.error(`Failed to load updated details for student ${student.id}:`, error);
            return {
              ...student,
              guardiansDetails: [] as User[]
            };
          }
        })
      );
      
      console.log('Final students with guardians:', studentsWithGuardians);
      
      setStudents(studentsWithGuardians);
      setParents(parentsData);
      setAdmins(adminsData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createUser(newStudent);
      setShowAddStudent(false);
      setNewStudent({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        roles: ['student'],
        status: 'active',
        profile: { timezone: 'Asia/Manila' }
      });
      loadAllUsers();
    } catch (error) {
      console.error('Failed to create student:', error);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    try {
      const updateData: UpdateUserDTO = {
        firstName: editingStudent.firstName,
        lastName: editingStudent.lastName,
        email: editingStudent.email,
        phone: editingStudent.phone,
        roles: editingStudent.roles,
        status: editingStudent.status,
        profile: editingStudent.profile
      };
      
      await adminAPI.updateUser(editingStudent.id, updateData);
      setEditingStudent(null);
      loadAllUsers();
    } catch (error) {
      console.error('Failed to update student:', error);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await adminAPI.deleteUser(studentId);
        loadAllUsers();
      } catch (error) {
        console.error('Failed to delete student:', error);
      }
    }
  };

  const handleLinkParent = async (parentId: string) => {
    if (!selectedStudent) return;
    
    try {
      await adminAPI.linkStudentToParent(selectedStudent.id, parentId);
      setShowLinkParent(false);
      setSelectedStudent(null);
      loadAllUsers();
    } catch (error) {
      console.error('Failed to link parent:', error);
    }
  };

  const handleUnlinkParent = async (studentId: string, parentId: string) => {
    try {
      await adminAPI.unlinkStudentFromParent(studentId, parentId);
      loadAllUsers();
    } catch (error) {
      console.error('Failed to unlink parent:', error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'invited': return 'status-invited';
      case 'suspended': return 'status-suspended';
      default: return '';
    }
  };

  const getUserDisplayName = (user: User) => {
    return user.fullName || `${user.firstName} ${user.lastName}`;
  };

  // Filter users based on active tab and search term
  const getFilteredUsers = () => {
    let users: User[] = [];
    
    switch (activeTab) {
      case 'students':
        users = students;
        break;
      case 'parents':
        users = parents;
        break;
      case 'admins':
        users = admins;
        break;
    }

    return users.filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredUsers = getFilteredUsers();

  if (isLoading) {
    return (
      <div className="user-management-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage students, view parents and admins</p>
      </div>

  

      {/* Tab Navigation */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Students ({students.length})
          </button>
          <button 
            className={`tab ${activeTab === 'parents' ? 'active' : ''}`}
            onClick={() => setActiveTab('parents')}
          >
            Parents ({parents.length})
          </button>
          <button 
            className={`tab ${activeTab === 'admins' ? 'active' : ''}`}
            onClick={() => setActiveTab('admins')}
          >
            Admins ({admins.length})
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {activeTab === 'students' && `Students (${filteredUsers.length})`}
            {activeTab === 'parents' && `Parents (${filteredUsers.length})`}
            {activeTab === 'admins' && `Admins (${filteredUsers.length})`}
          </h2>
          <div className="controls">
            <div className="search-box">
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="suspended">Suspended</option>
            </select>
            {activeTab === 'students' && (
              <button 
                className="btn btn-primary" 
                onClick={() => setShowAddStudent(true)}
              >
                + Add Student
              </button>
            )}
            <button className="btn btn-secondary" onClick={loadAllUsers}>
              Refresh
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Status</th>
                {activeTab === 'students' && <th>Guardians</th>}
                {activeTab === 'parents' && <th>Linked Students</th>}
                <th>Last Login</th>
                <th>Joined</th>
                {activeTab === 'students' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.firstName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{getUserDisplayName(user)}</strong>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div>{user.email}</div>
                      {user.phone && <div className="phone">{user.phone}</div>}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  
                  {/* Students Tab - Guardians Column */}
                  {activeTab === 'students' && (
                    <td>
                      <div className="guardians-info">
                        {(user as UserWithGuardians).guardiansDetails && 
                        (user as UserWithGuardians).guardiansDetails!.length > 0 ? (
                          <div className="guardians-list">
                            {(user as UserWithGuardians).guardiansDetails!.map((guardian) => (
                              <div key={guardian.id} className="guardian-item">
                                <div className="guardian-details">
                                  <strong>{getUserDisplayName(guardian)}</strong>
                                  <div className="guardian-phone">{guardian.phone || 'No phone'}</div>
                                </div>
                                <button
                                  className="btn-unlink"
                                  onClick={() => handleUnlinkParent(user.id, guardian.id)}
                                  title="Unlink guardian"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              className="btn-link"
                              onClick={() => {
                                setSelectedStudent(user);
                                setShowLinkParent(true);
                              }}
                            >
                              + Add Another Guardian
                            </button>
                          </div>
                        ) : (
                          <div className="no-guardians">
                            <p>No guardians assigned</p>
                            <button
                              className="btn-link"
                              onClick={() => {
                                setSelectedStudent(user);
                                setShowLinkParent(true);
                              }}
                            >
                              Add Guardian
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  )}

                  {/* Parents Tab - Linked Students Column */}
                  {activeTab === 'parents' && (
                    <td>
                      <div className="linked-students">
                        {user.guardianOf && user.guardianOf.length > 0 ? (
                          <span>{user.guardianOf.length} student(s)</span>
                        ) : (
                          <span>No students linked</span>
                        )}
                      </div>
                    </td>
                  )}

                  <td>
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  
                  {/* Actions Column - Only for Students */}
                  {activeTab === 'students' && (
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingStudent(user)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteStudent(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}

                  {/* Empty Actions Column for Parents and Admins */}
                  {(activeTab === 'parents' || activeTab === 'admins') && (
                    <td>-</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>No {activeTab} found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="modal-overlay" onClick={() => setShowAddStudent(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Student</h3>
              <button className="btn-close" onClick={() => setShowAddStudent(false)}>×</button>
            </div>
            <form onSubmit={handleAddStudent} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={newStudent.phone || ''}
                    onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newStudent.status}
                    onChange={(e) => setNewStudent({...newStudent, status: e.target.value as any})}
                  >
                    <option value="active">Active</option>
                    <option value="invited">Invited</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Initial Password</label>
                <input
                  type="password"
                  placeholder="Leave empty for auto-generate"
                  onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddStudent(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="modal-overlay" onClick={() => setEditingStudent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Student: {getUserDisplayName(editingStudent)}</h3>
              <button className="btn-close" onClick={() => setEditingStudent(null)}>×</button>
            </div>
            <form onSubmit={handleUpdateStudent} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={editingStudent.firstName}
                    onChange={(e) => setEditingStudent({...editingStudent, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={editingStudent.lastName}
                    onChange={(e) => setEditingStudent({...editingStudent, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={editingStudent.phone || ''}
                    onChange={(e) => setEditingStudent({...editingStudent, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({...editingStudent, status: e.target.value as any})}
                  >
                    <option value="active">Active</option>
                    <option value="invited">Invited</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingStudent(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Parent Modal */}
      {showLinkParent && selectedStudent && (
        <div className="modal-overlay" onClick={() => {
          setShowLinkParent(false);
          setSelectedStudent(null);
        }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Link Guardian to {getUserDisplayName(selectedStudent)}</h3>
              <button className="btn-close" onClick={() => {
                setShowLinkParent(false);
                setSelectedStudent(null);
              }}>×</button>
            </div>
            <div className="modal-content">
              <div className="parents-list">
                <h4>Available Parents</h4>
                {parents.length === 0 ? (
                  <p>No parents available.</p>
                ) : (
                  parents.map((parent) => (
                    <div key={parent.id} className="parent-item">
                      <div className="parent-info">
                        <strong>{getUserDisplayName(parent)}</strong>
                        <div className="parent-email">{parent.email}</div>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleLinkParent(parent.id)}
                      >
                        Link
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};