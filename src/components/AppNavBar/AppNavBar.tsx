import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminUser } from '../../contexts/AdminUserContext';
import './AppNavBar.css';

export const AppNavBar: React.FC = () => {
  const { adminUser, logout } = useAdminUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
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
        <Link to="/users" className="nav-btn">Users</Link>
        <Link to="/sessions" className="nav-btn">Sessions</Link>
        <Link to="/analytics" className="nav-btn">Analytics</Link>
        <Link to="/settings" className="nav-btn">Settings</Link>
      </div>

      {/* User Info / Dropdown */}
      <div className="navbar-user">
        <span className="user-greeting">Welcome, {adminUser?.name}</span>
        <div className="user-menu">
          <button
            className="user-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {adminUser?.name.charAt(0).toUpperCase()}
          </button>

          {isMenuOpen && (
            <div className="user-dropdown">
              <div className="user-details">
                <strong>{adminUser?.name}</strong>
                <span>{adminUser?.email}</span>
                <span className="user-role">{adminUser?.role}</span>
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
