import React, { useState, useEffect } from 'react';
import { advertisementAPI, formatCurrency, formatDate, getStatusDisplayName } from './utils/advertisementUtils';
import toast from 'react-hot-toast';
import axios from '../../helpers/axios';

const AdminAdvertisements = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAd, setSelectedAd] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  
  // Bulk selection
  const [selectedAds, setSelectedAds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Get API URL
  const getApiUrl = () => {
    return process.env.NODE_ENV === 'development' 
      ? 'http://localhost:2000/api' 
      : 'https://deviceinfohub-server.vercel.app/api';
  };

  // Get full image URL
  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:2000' 
      : 'https://deviceinfohub-server.vercel.app';
    
    return `${apiUrl}${url}`;
  };

  useEffect(() => {
    fetchAllAdvertisements();
  }, []);

  const fetchAllAdvertisements = async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const response = await axios.get(`${apiUrl}/advertisements`);
      
      if (response.data.success) {
        setAdvertisements(response.data.data);
      } else {
        toast.error('Failed to fetch advertisements');
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      toast.error(error.response?.data?.error || 'Error loading advertisements');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adId) => {
    try {
      const apiUrl = getApiUrl();
      const response = await axios.put(`${apiUrl}/advertisements/${adId}/approve`);
      
      if (response.data.success) {
        toast.success('Advertisement approved successfully!');
        fetchAllAdvertisements();
      }
    } catch (error) {
      console.error('Error approving advertisement:', error);
      toast.error('Error approving advertisement');
    }
  };

  const handleReject = async (adId, reason) => {
    try {
      const apiUrl = getApiUrl();
      const response = await axios.put(`${apiUrl}/advertisements/${adId}/reject`, {
        rejectionReason: reason || 'Does not meet guidelines'
      });
      
      if (response.data.success) {
        toast.success('Advertisement rejected');
        fetchAllAdvertisements();
      }
    } catch (error) {
      console.error('Error rejecting advertisement:', error);
      toast.error('Error rejecting advertisement');
    }
  };

  const handleStop = async (adId) => {
    try {
      const apiUrl = getApiUrl();
      const response = await axios.put(`${apiUrl}/advertisements/${adId}/stop`);
      
      if (response.data.success) {
        toast.success('Advertisement stopped successfully!');
        fetchAllAdvertisements();
      }
    } catch (error) {
      console.error('Error stopping advertisement:', error);
      toast.error('Error stopping advertisement');
    }
  };

  const handleDelete = async (adId) => {
    if (!window.confirm('Are you sure you want to delete this advertisement? This action cannot be undone.')) {
      return;
    }

    try {
      const apiUrl = getApiUrl();
      const response = await axios.delete(`${apiUrl}/advertisements/${adId}`);
      
      if (response.data.success) {
        toast.success('Advertisement deleted successfully!');
        fetchAllAdvertisements();
      }
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast.error('Error deleting advertisement');
    }
  };

  const handleStatusChange = async (adId, newStatus) => {
    try {
      const apiUrl = getApiUrl();
      const response = await axios.put(`${apiUrl}/advertisements/${adId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        toast.success(`Status changed to ${newStatus}`);
        fetchAllAdvertisements();
      }
    } catch (error) {
      console.error('Error changing status:', error);
      toast.error('Error changing status');
    }
  };

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedAds([]);
      setSelectAll(false);
    } else {
      setSelectedAds(filteredAds.map(ad => ad._id));
      setSelectAll(true);
    }
  };

  const toggleSelectAd = (adId) => {
    if (selectedAds.includes(adId)) {
      setSelectedAds(selectedAds.filter(id => id !== adId));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedAds, adId];
      setSelectedAds(newSelected);
      if (newSelected.length === filteredAds.length) {
        setSelectAll(true);
      }
    }
  };

  const clearSelection = () => {
    setSelectedAds([]);
    setSelectAll(false);
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedAds.length === 0) {
      toast.error('Please select at least one advertisement');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedAds.length} advertisement(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const apiUrl = getApiUrl();
      let successCount = 0;
      let errorCount = 0;

      for (const adId of selectedAds) {
        try {
          await axios.delete(`${apiUrl}/advertisements/${adId}`);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Error deleting ad ${adId}:`, error);
        }
      }

      toast.success(`${successCount} advertisement(s) deleted successfully!`);
      if (errorCount > 0) {
        toast.error(`${errorCount} advertisement(s) failed to delete`);
      }

      clearSelection();
      fetchAllAdvertisements();
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('Error deleting advertisements');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedAds.length === 0) {
      toast.error('Please select at least one advertisement');
      return;
    }

    try {
      const apiUrl = getApiUrl();
      let successCount = 0;
      let errorCount = 0;

      for (const adId of selectedAds) {
        try {
          await axios.put(`${apiUrl}/advertisements/${adId}/approve`);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Error approving ad ${adId}:`, error);
        }
      }

      toast.success(`${successCount} advertisement(s) approved!`);
      if (errorCount > 0) {
        toast.error(`${errorCount} advertisement(s) failed to approve`);
      }

      clearSelection();
      fetchAllAdvertisements();
    } catch (error) {
      console.error('Error in bulk approve:', error);
      toast.error('Error approving advertisements');
    }
  };

  const handleBulkReject = async () => {
    if (selectedAds.length === 0) {
      toast.error('Please select at least one advertisement');
      return;
    }

    const reason = window.prompt('Enter rejection reason (optional):');

    try {
      const apiUrl = getApiUrl();
      let successCount = 0;
      let errorCount = 0;

      for (const adId of selectedAds) {
        try {
          await axios.put(`${apiUrl}/advertisements/${adId}/reject`, {
            rejectionReason: reason || 'Bulk rejection'
          });
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Error rejecting ad ${adId}:`, error);
        }
      }

      toast.success(`${successCount} advertisement(s) rejected!`);
      if (errorCount > 0) {
        toast.error(`${errorCount} advertisement(s) failed to reject`);
      }

      clearSelection();
      fetchAllAdvertisements();
    } catch (error) {
      console.error('Error in bulk reject:', error);
      toast.error('Error rejecting advertisements');
    }
  };

  const handleBulkStop = async () => {
    if (selectedAds.length === 0) {
      toast.error('Please select at least one advertisement');
      return;
    }

    try {
      const apiUrl = getApiUrl();
      let successCount = 0;
      let errorCount = 0;

      for (const adId of selectedAds) {
        try {
          await axios.put(`${apiUrl}/advertisements/${adId}/stop`);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Error stopping ad ${adId}:`, error);
        }
      }

      toast.success(`${successCount} advertisement(s) stopped!`);
      if (errorCount > 0) {
        toast.error(`${errorCount} advertisement(s) failed to stop`);
      }

      clearSelection();
      fetchAllAdvertisements();
    } catch (error) {
      console.error('Error in bulk stop:', error);
      toast.error('Error stopping advertisements');
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedAds.length === 0) {
      toast.error('Please select at least one advertisement');
      return;
    }

    try {
      const apiUrl = getApiUrl();
      let successCount = 0;
      let errorCount = 0;

      for (const adId of selectedAds) {
        try {
          await axios.put(`${apiUrl}/advertisements/${adId}/status`, {
            status: newStatus
          });
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Error changing status for ad ${adId}:`, error);
        }
      }

      toast.success(`${successCount} advertisement(s) status changed to ${newStatus}!`);
      if (errorCount > 0) {
        toast.error(`${errorCount} advertisement(s) failed to update`);
      }

      clearSelection();
      fetchAllAdvertisements();
    } catch (error) {
      console.error('Error in bulk status change:', error);
      toast.error('Error changing status');
    }
  };

  const openModal = (ad, action) => {
    setSelectedAd(ad);
    setModalAction(action);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedAd(null);
    setModalAction(null);
    setShowModal(false);
  };

  const filteredAds = advertisements.filter(ad => {
    if (filter === 'all') return true;
    return ad.status === filter;
  });

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-blue-100 text-blue-800 border-blue-300',
      active: 'bg-green-100 text-green-800 border-green-300',
      inactive: 'bg-gray-100 text-gray-800 border-gray-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      expired: 'bg-orange-100 text-orange-800 border-orange-300',
      stopped: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getTypeIcon = (type) => {
    const icons = { photo: '🖼️', video: '🎥', slider: '🎞️' };
    return icons[type] || '📄';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading advertisements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🛠️ Admin - Advertisement Management</h1>
              <p className="text-gray-600 mt-1">Full control over all advertisements</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Total: {advertisements.length} ads</span>
              <button
                onClick={fetchAllAdvertisements}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 border-2 border-yellow-200">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {advertisements.filter(ad => ad.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-green-200">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {advertisements.filter(ad => ad.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-blue-600">
              {advertisements.filter(ad => ad.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-red-200">
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {advertisements.filter(ad => ad.status === 'rejected').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
            <p className="text-sm text-gray-600">Stopped</p>
            <p className="text-2xl font-bold text-gray-600">
              {advertisements.filter(ad => ad.status === 'stopped').length}
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedAds.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-blue-900">
                  {selectedAds.length} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear Selection
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkApprove}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                >
                  ✓ Approve Selected
                </button>
                <button
                  onClick={handleBulkReject}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium"
                >
                  ✗ Reject Selected
                </button>
                <button
                  onClick={handleBulkStop}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium"
                >
                  ⏸️ Stop Selected
                </button>
                <button
                  onClick={() => handleBulkStatusChange('active')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                >
                  ▶️ Activate Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  🗑️ Delete Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {['all', 'pending', 'active', 'approved', 'rejected', 'stopped', 'expired'].map(status => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  clearSelection(); // Clear selection when changing filter
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && ` (${advertisements.filter(ad => ad.status === status).length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advertisements Table */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {filteredAds.length === 0 ? (
          <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No advertisements found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "There are no advertisements in the system."
                : `There are no ${filter} advertisements.`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title & Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAds.map(ad => (
                    <tr key={ad._id} className={`hover:bg-gray-50 ${selectedAds.includes(ad._id) ? 'bg-blue-50' : ''}`}>
                      {/* Checkbox */}
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedAds.includes(ad._id)}
                          onChange={() => toggleSelectAd(ad._id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      
                      {/* Preview */}
                      <td className="px-6 py-4">
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          {ad.type === 'photo' && ad.content?.mediaUrl && (
                            <img
                              src={getFullImageUrl(ad.content.mediaUrl)}
                              alt={ad.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {ad.type === 'slider' && ad.content?.slides?.[0] && (
                            <img
                              src={getFullImageUrl(ad.content.slides[0].mediaUrl)}
                              alt={ad.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-1 rounded-tl">
                            {getTypeIcon(ad.type)}
                          </div>
                        </div>
                      </td>

                      {/* Title & Details */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          📍 {ad.placement?.category?.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs text-gray-500">
                          📅 {formatDate(ad.schedule?.startDate)} • {ad.schedule?.duration} days
                        </div>
                        <div className="text-xs text-gray-500">
                          💰 {formatCurrency(ad.pricing?.totalCost || 0)}
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{ad.createdBy?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{ad.createdBy?.email || 'N/A'}</div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(ad.status)}`}>
                          {getStatusDisplayName(ad.status)}
                        </span>
                      </td>

                      {/* Performance */}
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600">
                          <div>👁️ {ad.performance?.impressions || 0} views</div>
                          <div>👆 {ad.performance?.clicks || 0} clicks</div>
                          <div>📊 {ad.performance?.ctr ? `${ad.performance.ctr.toFixed(2)}%` : '0%'} CTR</div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          {ad.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(ad._id)}
                                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => openModal(ad, 'reject')}
                                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                              >
                                ✗ Reject
                              </button>
                            </>
                          )}

                          {ad.status === 'active' && (
                            <button
                              onClick={() => handleStop(ad._id)}
                              className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                            >
                              ⏸️ Stop
                            </button>
                          )}

                          {(ad.status === 'stopped' || ad.status === 'inactive') && (
                            <button
                              onClick={() => handleStatusChange(ad._id, 'active')}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                            >
                              ▶️ Activate
                            </button>
                          )}

                          <button
                            onClick={() => openModal(ad, 'details')}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                          >
                            👁️ View
                          </button>

                          <button
                            onClick={() => handleDelete(ad._id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedAd.title}</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {modalAction === 'details' && (
                <div className="space-y-4">
                  {/* Preview */}
                  {selectedAd.type === 'photo' && selectedAd.content?.mediaUrl && (
                    <img
                      src={getFullImageUrl(selectedAd.content.mediaUrl)}
                      alt={selectedAd.title}
                      className="w-full rounded-lg"
                    />
                  )}

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Type:</strong> {selectedAd.type}
                    </div>
                    <div>
                      <strong>Status:</strong> {selectedAd.status}
                    </div>
                    <div>
                      <strong>Placement:</strong> {selectedAd.placement?.category}
                    </div>
                    <div>
                      <strong>Duration:</strong> {selectedAd.schedule?.duration} days
                    </div>
                    <div>
                      <strong>Cost:</strong> {formatCurrency(selectedAd.pricing?.totalCost || 0)}
                    </div>
                    <div>
                      <strong>Impressions:</strong> {selectedAd.performance?.impressions || 0}
                    </div>
                  </div>
                </div>
              )}

              {modalAction === 'reject' && (
                <div className="space-y-4">
                  <p>Are you sure you want to reject this advertisement?</p>
                  <input
                    type="text"
                    placeholder="Rejection reason (optional)"
                    id="rejection-reason"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        const reason = document.getElementById('rejection-reason').value;
                        handleReject(selectedAd._id, reason);
                        closeModal();
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Reject
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdvertisements;

