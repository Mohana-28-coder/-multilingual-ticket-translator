import React, { useState } from 'react';
import { FiX, FiSend } from 'react-icons/fi';
import { toast } from 'react-toastify';
import FileUpload from './FileUpload';
import { ticketAPI } from '../services/api';

const TicketForm = ({ onClose, onSuccess }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('description', description);
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      await ticketAPI.create(formData);
      toast.success('Ticket submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaste = (e) => {
    const clipboardData = e.clipboardData;
    const items = clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: blob.type });
        setFiles(prev => [...prev, file]);
        toast.info('Image pasted from clipboard');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Submit New Ticket</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.9rem', 
              marginBottom: '1.5rem' 
            }}>
              Write in any language — our AI will automatically detect and translate it.
            </p>

            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Brief summary of your issue..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="textarea"
                placeholder="Describe your issue in detail. You can write in any language..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onPaste={handlePaste}
                required
                rows={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Attachments (Optional)</label>
              <FileUpload files={files} setFiles={setFiles} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="loading-spinner" />
                  Submitting...
                </>
              ) : (
                <>
                  <FiSend />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;