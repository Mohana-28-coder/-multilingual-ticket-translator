import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGlobe, FiHome, FiInbox, FiPlusCircle, FiSettings, FiBarChart2, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <FiGlobe size={22} />
            </div>
            <div className="sidebar-logo-text">
              MTT
              <span>Ticket Translator</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Main Menu</div>
            
            {isAdmin ? (
              <>
                <NavLink 
                  to="/admin/dashboard" 
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <FiBarChart2 />
                  Dashboard
                </NavLink>
                <NavLink 
                  to="/admin/dashboard" 
                  className="sidebar-link"
                  onClick={onClose}
                >
                  <FiInbox />
                  All Tickets
                </NavLink>
              </>
            ) : (
              <>
                <NavLink 
                  to="/client/dashboard" 
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <FiHome />
                  My Tickets
                </NavLink>
                <NavLink 
                  to="/client/dashboard" 
                  state={{ openForm: true }}
                  className="sidebar-link"
                  onClick={onClose}
                >
                  <FiPlusCircle />
                  New Ticket
                </NavLink>
              </>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.full_name || user?.username}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;