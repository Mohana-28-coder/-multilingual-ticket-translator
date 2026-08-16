import React from 'react';
import { Link } from 'react-router-dom';
import { FiGlobe, FiUsers, FiCpu, FiMessageSquare, FiShield, FiZap } from 'react-icons/fi';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-logo">
          <div className="logo-icon">
            <FiGlobe />
          </div>
        </div>
        
        <h1 className="home-title">Multilingual Ticket Translator</h1>
        <p className="home-slogan">
          Breaking language barriers, one ticket at a time.<br />
          AI-powered support that speaks your language.
        </p>
        
        <div className="home-buttons">
          <Link to="/client/login" className="home-btn home-btn-client">
            <FiUsers />
            Client Portal
          </Link>
          <Link to="/admin/login" className="home-btn home-btn-admin">
            <FiShield />
            Admin Dashboard
          </Link>
        </div>
        
        <div className="home-features">
          <div className="feature-item">
            <div className="feature-icon">
              <FiGlobe />
            </div>
            <h3 className="feature-title">40+ Languages</h3>
            <p className="feature-desc">Auto-detect and translate tickets in real-time</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <FiCpu />
            </div>
            <h3 className="feature-title">AI-Powered</h3>
            <p className="feature-desc">Smart suggestions for faster responses</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <FiZap />
            </div>
            <h3 className="feature-title">Real-Time</h3>
            <p className="feature-desc">Instant translation and status updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;