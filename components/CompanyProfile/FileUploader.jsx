// components/CompanyProfile/FileUploader.jsx
// File upload component for compliance documents and certificates
// Handles file selection, upload progress, and file management

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';

export default function FileUploader({ 
  acceptedTypes = ".pdf,.doc,.docx,.jpg,.png", 
  maxSize = 5, // MB
  onFileUpload,
  existingFiles = [],
  disabled = false
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState(existingFiles);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file selection
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Process selected files
  const handleFiles = async (fileList) => {
    setError(null);
    const newFiles = Array.from(fileList);
    
    for (const file of newFiles) {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        continue;
      }
      
      // Validate file type
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const acceptedExtensions = acceptedTypes.split(',').map(type => 
        type.trim().replace('.', '')
      );
      
      if (!acceptedExtensions.includes(fileExtension)) {
        setError(`File ${file.name} is not an accepted file type. Please upload ${acceptedTypes}.`);
        continue;
      }
      
      try {
        setUploading(true);
        
        // Simulate file upload (replace with actual upload logic)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          status: 'uploaded',
          file: file // Store the actual file object
        };
        
        const updatedFiles = [...files, newFile];
        setFiles(updatedFiles);
        
        if (onFileUpload) {
          onFileUpload(newFile);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        setError(`Failed to upload ${file.name}`);
      } finally {
        setUploading(false);
      }
    }
  };

  // Remove file
  const removeFile = (fileId) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    
    // Notify parent component
    if (onFileUpload) {
      const removedFile = files.find(file => file.id === fileId);
      if (removedFile) {
        onFileUpload(null, removedFile);
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!disabled && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={disabled}
          />
          
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {acceptedTypes.replace(/\./g, '').toUpperCase()} up to {maxSize}MB
            </p>
          </div>
          
          {uploading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Uploading...</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle className="inline-block w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Files</h4>
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}