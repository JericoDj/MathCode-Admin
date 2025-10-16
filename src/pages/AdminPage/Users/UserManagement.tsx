import React, { useState, useEffect } from 'react';
import type { User, CreateUserDTO, UpdateUserDTO } from '../../../types';
import { adminAPI } from '../../../utils/auth.api.tsx';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import { SimpleDialogExample } from './SimpleDialogExample';
import './UserManagement.css';
import { AddStudentDialog } from '../../../components/Users/AddStudentDialog.tsx';

// Extended interface for users with populated guardian data
interface UserWithGuardians extends User {
  guardiansDetails?: User[];
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
  const [selectedStudent, setSelectedStudent] = useState<UserWithGuardians | null>(null);
  const [editingStudent, setEditingStudent] = useState<UserWithGuardians | null>(null);

  // Form state for new student
  const [newStudent, setNewStudent] = useState<CreateUserDTO>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roles: ['student'],
    status: 'active',
    profile: { timezone: 'Asia/Manila' }
  });

  useEffect(() => {
    loadAllUsers();
  }, []);

  // Load all users and populate guardians for students
  const loadAllUsers = async () => {
    try {
      setIsLoading(true);

      const [studentsData, parentsData, adminsData] = await Promise.all([
        adminAPI.getUsersByRole('student'),
        adminAPI.getUsersByRole('parent'),
        adminAPI.getUsersByRole('admin')
      ]);

      // Populate student guardians
      const studentsWithGuardians = await Promise.all(
        studentsData.map(async (student) => {
          try {
            const updatedStudent = await adminAPI.getUpdatedStudentDetails(student.id);
            let guardiansDetails: User[] = [];

            if (updatedStudent.guardians?.length) {
              const parentDetails = await adminAPI.getParentDetails(updatedStudent.guardians[0]);
              if (parentDetails) {
                guardiansDetails.push({
                  ...parentDetails,
                  fullName: parentDetails.fullName || `${parentDetails.firstName} ${parentDetails.lastName}`.trim()
                });
              }
            }

            return { ...student, guardiansDetails };
          } catch (error) {
            console.error(`Failed to load guardians for ${student.id}`, error);
            return { ...student, guardiansDetails: [] };
          }
        })
      );

      setStudents(studentsWithGuardians);
      setParents(parentsData);
      setAdmins(adminsData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add, Update, Delete, Link, Unlink functions
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

  const getUserDisplayName = (user: User) => user.fullName || `${user.firstName} ${user.lastName}`;

  const getFilteredUsers = () => {
    let users: User[] = activeTab === 'students' ? students : activeTab === 'parents' ? parents : admins;
    return users.filter(user => {
      const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredUsers = getFilteredUsers();

  if (isLoading) return <div className="user-management-loading"><LoadingSpinner size="large" /></div>;

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage students, view parents and admins</p>
      </div>

      <div>
        <h2>My Page</h2>
        <SimpleDialogExample />
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
            Students ({students.length})
          </button>
          <button className={`tab ${activeTab === 'parents' ? 'active' : ''}`} onClick={() => setActiveTab('parents')}>
            Parents ({parents.length})
          </button>
          <button className={`tab ${activeTab === 'admins' ? 'active' : ''}`} onClick={() => setActiveTab('admins')}>
            Admins ({admins.length})
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ({filteredUsers.length})</h2>
          <div className="controls">
            <input type="text" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input"/>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="suspended">Suspended</option>
            </select>
            {activeTab === 'students' && <button className="btn btn-primary" onClick={() => setShowAddStudent(true)}>+ Add Student</button>}
            <button className="btn btn-secondary" onClick={loadAllUsers}>Refresh</button>
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
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">{user.firstName?.charAt(0).toUpperCase()}</div>
                      <div><strong>{getUserDisplayName(user)}</strong><div className="user-email">{user.email}</div></div>
                    </div>
                  </td>
                  <td>{user.email}{user.phone && <div className="phone">{user.phone}</div>}</td>
                  <td><span className={`status-badge ${getStatusBadgeClass(user.status)}`}>{user.status}</span></td>

                  {activeTab === 'students' && (
                    <td>
                      {(user as UserWithGuardians).guardiansDetails?.length ? (
                        <div className="guardians-list">
                          {(user as UserWithGuardians).guardiansDetails!.map(guardian => (
                            <div key={guardian.id} className="guardian-item">
                              <strong>{getUserDisplayName(guardian)}</strong>
                              <div className="guardian-phone">{guardian.phone || 'No phone'}</div>
                              <button className="btn-unlink" onClick={() => handleUnlinkParent(user.id, guardian.id)}>×</button>
                            </div>
                          ))}
                          <button className="btn-link" onClick={() => { setSelectedStudent(user as UserWithGuardians); setShowLinkParent(true); }}>+ Add Another Guardian</button>
                        </div>
                      ) : (
                        <div className="no-guardians">
                          <p>No guardians assigned</p>
                          <button className="btn-link" onClick={() => { setSelectedStudent(user as UserWithGuardians); setShowLinkParent(true); }}>Add Guardian</button>
                        </div>
                      )}
                    </td>
                  )}

                  {activeTab === 'parents' && (
                    <td>{user.guardianOf?.length ? `${user.guardianOf.length} student(s)` : 'No students linked'}</td>
                  )}

                  <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>

                  {activeTab === 'students' ? (
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingStudent(user as UserWithGuardians)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteStudent(user.id)}>Delete</button>
                    </td>
                  ) : <td>-</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && <div className="empty-state"><p>No {activeTab} found matching your criteria.</p></div>}
      </div>

      {/* Add Student Modal */}
      {/* Add Student Modal */}
{showAddStudent && (
  <div className="modal-overlay" onClick={() => setShowAddStudent(false)}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Add New Student</h3>
        <button className="btn-close" onClick={() => setShowAddStudent(false)}>×</button>
      </div>
      <form onSubmit={handleAddStudent} className="modal-form">
        ...
      </form>
    </div>
  </div>
)}
      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="modal-overlay" onClick={() => setEditingStudent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Student: {getUserDisplayName(editingStudent)}</h3>
              <button className="btn-close" onClick={() => setEditingStudent(null)}>×</button>
            </div>
            <form onSubmit={handleUpdateStudent} className="modal-form">
              <div className="form-row">
                <div className="form-group"><label>First Name</label><input type="text" value={editingStudent.firstName} onChange={e => setEditingStudent({...editingStudent, firstName: e.target.value})} required/></div>
                <div className="form-group"><label>Last Name</label><input type="text" value={editingStudent.lastName} onChange={e => setEditingStudent({...editingStudent, lastName: e.target.value})} required/></div>
              </div>
              <div className="form-group"><label>Email</label><input type="email" value={editingStudent.email} onChange={e => setEditingStudent({...editingStudent, email: e.target.value})} required/></div>
              <div className="form-row">
                <div className="form-group"><label>Phone</label><input type="tel" value={editingStudent.phone || ''} onChange={e => setEditingStudent({...editingStudent, phone: e.target.value})}/></div>
                <div className="form-group"><label>Status</label>
                  <select value={editingStudent.status} onChange={e => setEditingStudent({...editingStudent, status: e.target.value as any})}>
                    <option value="active">Active</option>
                    <option value="invited">Invited</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingStudent(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Parent Modal */}
      {showLinkParent && selectedStudent && (
        <div className="modal-overlay" onClick={() => { setShowLinkParent(false); setSelectedStudent(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Link Guardian to {getUserDisplayName(selectedStudent)}</h3>
              <button className="btn-close" onClick={() => { setShowLinkParent(false); setSelectedStudent(null); }}>×</button>
            </div>
            <div className="modal-content">
              <h4>Available Parents</h4>
              {parents.length === 0 ? <p>No parents available.</p> : parents.map(parent => (
                <div key={parent.id} className="parent-item">
                  <strong>{getUserDisplayName(parent)}</strong> <div className="parent-email">{parent.email}</div>
                  <button className="btn btn-primary btn-sm" onClick={() => handleLinkParent(parent.id)}>Link</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
