import React, { useState, useEffect, useCallback } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import KPICards from './KPICards';
import TicketList from './TicketList';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [kpiData, setKpiData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState({ status: '', priority: '' });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [kpiResponse, ticketsResponse] = await Promise.all([
        adminAPI.getKPI(),
        adminAPI.getAllTickets(filter),
      ]);
      setKpiData(kpiResponse.data);
      setTickets(Array.isArray(ticketsResponse.data) ? ticketsResponse.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="dashboard-main">
        <Navbar
          title="Admin Dashboard"
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="dashboard-content">
          <KPICards kpiData={kpiData} />
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">All Tickets (FIFO)</h2>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <select
                  className="form-input"
                  style={{ width: 'auto', padding: '0.5rem 1rem' }}
                  value={filter.status}
                  onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="delivered">Delivered</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select
                  className="form-input"
                  style={{ width: 'auto', padding: '0.5rem 1rem' }}
                  value={filter.priority}
                  onChange={(e) => setFilter(f => ({ ...f, priority: e.target.value }))}
                >
                  <option value="">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={fetchData}
                >
                  <FiRefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {isLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <span className="loading-spinner" style={{ width: 32, height: 32 }} />
                </div>
              ) : tickets.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No tickets found
                </div>
              ) : (
                <TicketList tickets={tickets} isAdmin />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;