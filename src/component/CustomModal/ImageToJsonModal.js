import React, { useState } from 'react';
import axios from '../../helpers/axios';

const ImageToJsonModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const onFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
    setResult(null);
  };

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

      // Auto-apply to the form if handler provided
      if (typeof onImport === 'function') {
        try {
          onImport(data);
        } catch (_) {
          // swallow errors from parent handler to keep modal responsive
        }
      }

      // Auto-close after successful response
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
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w/full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Image to JSON</h2>

        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="w-full text-sm text-slate-700 dark:text-slate-200"
          />

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
