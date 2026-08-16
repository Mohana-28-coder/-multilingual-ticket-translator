import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import TicketList from './TicketList';
import TicketForm from './TicketForm';
import { ticketAPI } from '../services/api';

const ClientDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openForm) {
      setShowForm(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchTickets = async () => {
    try {
      const response = await ticketAPI.getAll();
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleTicketCreated = () => {
    fetchTickets();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="dashboard-main">
        <Navbar 
          title="My Tickets" 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="dashboard-content">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Support Tickets</h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={fetchTickets}
                >
                  <FiRefreshCw size={16} />
                  Refresh
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowForm(true)}
                >
                  <FiPlus size={16} />
                  New Ticket
                </button>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {isLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <span className="loading-spinner" style={{ width: 32, height: 32 }} />
                </div>
              ) : (
                <TicketList tickets={tickets} />
              )}
            </div>
          </div>
        </div>
      </main>

      {showForm && (
        <TicketForm 
          onClose={() => setShowForm(false)}
          onSuccess={handleTicketCreated}
        />
      )}
    </div>
  );
};

export default ClientDashboard;