import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FiInbox } from 'react-icons/fi';

const TicketList = ({ tickets, isAdmin = false }) => {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <FiInbox size={36} />
        </div>
        <h3 className="empty-title">No tickets yet</h3>
        <p className="empty-desc">
          {isAdmin 
            ? 'Tickets from clients will appear here'
            : 'Submit your first ticket to get started'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Ticket #</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Priority</th>
            {isAdmin && <th>Language</th>}
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>
                <Link to={`/ticket/${ticket.id}`} className="table-link">
                  {ticket.ticket_number}
                </Link>
              </td>
              <td style={{ maxWidth: '300px' }}>
                <div style={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {ticket.subject}
                </div>
              </td>
              <td>
                <span className={`status-badge status-${ticket.status}`}>
                  {ticket.status}
                </span>
              </td>
              <td>
                <span className={`priority-badge priority-${ticket.priority}`}>
                  {ticket.priority}
                </span>
              </td>
              {isAdmin && (
                <td>
                  {ticket.detected_language || 'Detecting...'}
                </td>
              )}
              <td>
                {format(new Date(ticket.created_at), 'MMM d, yyyy HH:mm')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketList;