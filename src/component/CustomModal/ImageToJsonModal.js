import React, { useRef, useState } from 'react';
import axios from '../../helpers/axios';

const ImageToJsonModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const assignFile = (f) => {
    if (!f) return;
    setFile(f);
    setError(null);
    setResult(null);
  };

  const onFileChange = (e) => {
    assignFile(e.target.files?.[0] || null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      assignFile(droppedFiles[0]);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onClickPick = () => fileInputRef.current?.click();

  const onSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      if (!file) {
        setError('Please choose an image file.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/ocr/image-to-json?lang=eng', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = response?.data || {};
      setResult(data);

      if (typeof onImport === 'function') {
        try {
          onImport(data);
        } catch (_) {
          // keep modal responsive
        }
      }

      onClose?.();
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Upload failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Image to JSON</h2>

        <div className="space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={onClickPick}
            className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
              ${isDragging ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'}`}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6H16a5 5 0 011 9.9M15 13l-3-3-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-slate-600 dark:text-slate-300">Drag & drop an image here, or click to browse</p>
              {file && (
                <p className="text-xs text-slate-500 dark:text-slate-400">Selected: {file.name}</p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white px-4 py-2 rounded-md"
              disabled={loading}
            >
              Close
            </button>
            <button
              onClick={onSubmit}
              className="bg-brand-primary text-white px-4 py-2 rounded-md disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Submit'}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Response (JSON)</p>
              <textarea
                readOnly
                value={JSON.stringify(result, null, 2)}
                className="w-full h-64 p-3 font-mono text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageToJsonModal;
