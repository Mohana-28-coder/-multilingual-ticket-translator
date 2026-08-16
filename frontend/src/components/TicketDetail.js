import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FiArrowLeft, FiGlobe, FiPaperclip, FiCpu, FiSend, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { ticketAPI, adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await ticketAPI.getById(id);
        setTicket(res.data);
      } catch (error) {
        toast.error('Failed to load ticket');
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicket();
  }, [id, navigate]);

  const fetchAISuggestion = async () => {
    setIsLoadingSuggestion(true);
    try {
      const res = await adminAPI.getAISuggestion(id);
      setAiSuggestion(res.data);
      setResponse(res.data.suggestion);
    } catch (error) {
      toast.error('Failed to generate AI suggestion');
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await ticketAPI.updateStatus(id, { status: newStatus });
      setTicket(prev => ({ ...prev, status: newStatus }));
      toast.success('Ticket updated to ' + newStatus);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSendResponse = async () => {
    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminAPI.respondToTicket(id, {
        original_response: response,
        use_ai_suggestion: !!aiSuggestion,
        ai_suggestion: aiSuggestion ? aiSuggestion.suggestion : null,
      });
      toast.success('Response sent and translated successfully!');
      const res = await ticketAPI.getById(id);
      setTicket(res.data);
      setResponse('');
      setAiSuggestion(null);
    } catch (error) {
      toast.error('Failed to send response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAttachments = () => {
    if (!ticket.attachments || ticket.attachments.length === 0) return null;
    return (
      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          <FiPaperclip /> Attachments ({ticket.attachments.length})
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {ticket.attachments.map(renderAttachmentLink)}
        </div>
        {ticket.attachments.map(renderExtractedText)}
      </div>
    );
  };

  const renderAttachmentLink = (att) => {
    const url = 'http://localhost:5000/uploads/' + att.filename;
    return (
      <a key={att.id} href={url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
        <FiPaperclip /> {att.original_filename}
      </a>
    );
  };

  const renderExtractedText = (att) => {
    if (!att.extracted_text) return null;
    return (
      <div key={'text-' + att.id} style={{ marginTop: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Extracted Text from {att.original_filename}
          {ticket.original_language !== 'en' && (
            <span style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}>
              (Translated to English)
            </span>
          )}
        </h4>
        <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{att.extracted_text}</p>
      </div>
    );
  };

  const renderResponses = () => {
    if (!ticket.responses || ticket.responses.length === 0) return null;
    return (
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <FiMessageSquare style={{ marginRight: '0.5rem' }} />
            Responses
          </h3>
        </div>
        <div className="card-body">
          {ticket.responses.map(renderSingleResponse)}
        </div>
      </div>
    );
  };

  const renderSingleResponse = (resp, index) => {
    return (
      <div key={resp.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: index < ticket.responses.length - 1 ? '1rem' : 0 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {format(new Date(resp.created_at), 'MMM d, yyyy HH:mm')}
          {resp.ai_suggested && (
            <span style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}>
              <FiCpu size={12} /> AI Assisted
            </span>
          )}
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
            Response (English):
          </span>
          <p>{resp.original_response}</p>
        </div>
        {resp.translated_response ? (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem', background: 'var(--primary-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              <FiGlobe size={12} />
              Translated Response ({resp.target_language ? resp.target_language.toUpperCase() : ''}):
            </span>
            <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {resp.translated_response}
            </p>
          </div>
        ) : (
          ticket.original_language === 'en' && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              No translation needed (ticket is in English)
            </div>
          )
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <span className="loading-spinner" style={{ width: 48, height: 48 }} />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="dashboard-main">
        <Navbar title={'Ticket ' + ticket.ticket_number} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="dashboard-content">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
            <FiArrowLeft /> Back
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
            <div>
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                  <div>
                    <h2 className="card-title">{ticket.subject}</h2>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
                      <span className={'status-badge status-' + ticket.status}>{ticket.status}</span>
                      <span className={'priority-badge priority-' + ticket.priority}>{ticket.priority}</span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {ticket.detected_language && ticket.detected_language !== 'English' && (
                    <div style={{ background: 'var(--primary-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FiGlobe color="var(--primary)" />
                      <span style={{ color: 'var(--primary)', fontWeight: 500 }}>
                        Detected Language: {ticket.detected_language}
                      </span>
                    </div>
                  )}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Original Message</h4>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
                  </div>
                  {isAdmin && ticket.translated_description && ticket.original_language !== 'en' && (
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiGlobe /> English Translation
                      </h4>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{ticket.translated_description}</p>
                    </div>
                  )}
                  {renderAttachments()}
                </div>
              </div>

              {renderResponses()}

              {isAdmin && ticket.status !== 'resolved' && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Respond to Ticket</h3>
                    <button className="btn btn-secondary btn-sm" onClick={fetchAISuggestion} disabled={isLoadingSuggestion}>
                      {isLoadingSuggestion ? 'Generating...' : <span><FiCpu /> Get AI Suggestion</span>}
                    </button>
                  </div>
                  <div className="card-body">
                    {ticket.original_language && ticket.original_language !== 'en' && (
                      <div style={{ background: 'var(--primary-bg)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.9rem' }}>
                        <FiGlobe />
                        Your response will be automatically translated to {ticket.detected_language} before sending to the client.
                      </div>
                    )}
                    {aiSuggestion && (
                      <div style={{ background: 'var(--primary-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 500, marginBottom: '0.5rem' }}>
                          <FiCpu /> AI Suggestion
                        </div>
                        <p style={{ fontSize: '0.9rem' }}>{aiSuggestion.suggestion}</p>
                        {aiSuggestion.translated_suggestion && (
                          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--primary-light)', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: 500 }}>
                              Preview in {aiSuggestion.language_name}:
                            </span>
                            <p style={{ marginTop: '0.25rem' }}>{aiSuggestion.translated_suggestion}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <textarea
                      className="textarea"
                      placeholder="Write your response in English — it will be automatically translated to the client's language..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={5}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                      <button className="btn btn-primary" onClick={handleSendResponse} disabled={isSubmitting || !response.trim()}>
                        {isSubmitting ? 'Sending and Translating...' : <span><FiSend /> Send Response</span>}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Ticket Info</h3>
                </div>
                <div className="card-body">
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ticket Number</div>
                    <div style={{ fontWeight: 600 }}>{ticket.ticket_number}</div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Created</div>
                    <div>{format(new Date(ticket.created_at), 'MMM d, yyyy HH:mm')}</div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last Updated</div>
                    <div>{format(new Date(ticket.updated_at), 'MMM d, yyyy HH:mm')}</div>
                  </div>
                  {ticket.detected_language && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Language</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiGlobe size={16} color="var(--primary)" />
                        {ticket.detected_language}
                      </div>
                    </div>
                  )}
                  {isAdmin && ticket.status !== 'resolved' && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Update Status</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleStatusChange('accepted')}>
                          <FiCheck /> Accept
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange('rejected')}>
                          <FiX /> Reject
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange('resolved')}>
                          <FiCheck /> Mark Resolved
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TicketDetail;