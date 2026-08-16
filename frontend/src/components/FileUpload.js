import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiImage, FiFileText, FiX } from 'react-icons/fi';

const FileUpload = ({ files, setFiles }) => {
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <FiImage />;
    if (file.type === 'application/pdf') return <FiFileText />;
    return <FiFile />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-icon">
          <FiUploadCloud size={28} />
        </div>
        <p className="dropzone-text">
          {isDragActive 
            ? 'Drop files here...'
            : 'Drag & drop files here, or click to browse'
          }
        </p>
        <p className="dropzone-hint">
          Supports: PDF, Images, Documents, Spreadsheets (Max 10MB)
        </p>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-icon">
                {getFileIcon(file)}
              </div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{formatFileSize(file.size)}</div>
              </div>
              <button 
                type="button"
                className="file-remove"
                onClick={() => removeFile(index)}
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;