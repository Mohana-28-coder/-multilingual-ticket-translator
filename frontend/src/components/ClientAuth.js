import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiLock, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const ClientAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    full_name: '',
  });
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
      } else {
        await register({
          ...formData,
          role: 'client',
        });
        toast.success('Account created successfully!');
      }
      navigate('/client/dashboard');
    } catch (err) {
      const message = err.response?.data?.detail || 'Authentication failed';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-back-link">
            <FiArrowLeft /> Back to Home
          </Link>
          <h1 className="auth-title">Client Portal</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to manage your tickets' : 'Create an account to get started'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? (
              <span className="loading-spinner" />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientAuth;