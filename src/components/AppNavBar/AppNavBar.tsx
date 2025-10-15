import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminUser } from '../../contexts/AdminUserContext';
import './AppNavBar.css';

export const AppNavBar: React.FC = () => {
  const { adminUser, logout } = useAdminUser();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);  // Close the menu on logout
  };

  return (
    <nav className="admin-navbar">
      {/* Brand / Logo */}
      <div className="navbar-brand">
        <h1>MathCode Admin</h1>
      </div>

      {/* Navigation Links */}
      <div className="navbar-links">
        <Link to="/dashboard" className="nav-btn">Dashboard</Link>
        <Link to="/users" className="nav-btn">User Management</Link>
        <Link to="/sessions" className="nav-btn">Sessions</Link>
        <Link to="/analytics" className="nav-btn">Analytics</Link>
        <Link to="/settings" className="nav-btn">Settings</Link>
      </div>

      {/* User Info / Dropdown */}
      <div className="navbar-user">
        <span className="user-greeting">Welcome, {adminUser?.firstName} {adminUser?.lastName}</span> {/* Concatenate first and last name */}
        <div className="user-menu">
          <button
            className="user-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {adminUser?.firstName.charAt(0).toUpperCase()} {/* Display first letter of firstName */}
          </button>

          {isMenuOpen && (
            <div className="user-dropdown">
              <div className="user-details">
                <strong>{`${adminUser?.firstName} ${adminUser?.lastName}`}</strong> {/* Concatenate firstName and lastName */}
                <span>{adminUser?.email}</span>
                <span className="user-role">{adminUser?.roles}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
