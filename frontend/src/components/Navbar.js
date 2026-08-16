import React from 'react';
import { FiMenu, FiLogOut, FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ title, onMenuClick }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <FiMenu size={24} />
        </button>
        <h1 className="navbar-title">{title}</h1>
      </div>
      
      <div className="navbar-right">
        <button className="navbar-btn">
          <FiBell size={20} />
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;