import React, { useState, useEffect } from 'react';
import { advertisementAPI, formatCurrency, formatDate, getStatusColor, getStatusDisplayName } from './utils/advertisementUtils';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import axios from '../../helpers/axios';

const MyAdvertisements = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, pending, rejected, expired
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [deletingId, setDeletingId] = useState(null);
  const [stoppingId, setStoppingId] = useState(null);
  
  // Get user role from Redux store
  const auth = useSelector(state => state.auth);
  const isAdmin = auth?.user?.role === 'admin';

  useEffect(() => {
    fetchMyAdvertisements();
    fetchMyStats();
  }, []);

  const fetchMyAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await advertisementAPI.getUserAds();
      
      if (response.success) {
        setAdvertisements(response.data);
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

  const fetchMyStats = async () => {
    try {
      const response = await advertisementAPI.getUserAdStats();
      
      if (response.success) {
        setStats(response.data.overall);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Admin Actions
  const handleDeleteAd = async (adId) => {
    if (!window.confirm('Are you sure you want to delete this advertisement? This action cannot be undone.')) {
      return;
    }

    setDeletingId(adId);
    try {
      await axios.delete(`/advertisements/${adId}`);
      toast.success('Advertisement deleted successfully!');
      fetchMyAdvertisements(); // Refresh list
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast.error(error.response?.data?.error || 'Failed to delete advertisement');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStopAd = async (adId) => {
    if (!window.confirm('Are you sure you want to stop this advertisement?')) {
      return;
    }

    setStoppingId(adId);
    try {
      await axios.put(`/advertisements/${adId}/stop`);
      toast.success('Advertisement stopped successfully!');
      fetchMyAdvertisements(); // Refresh list
    } catch (error) {
      console.error('Error stopping advertisement:', error);
      toast.error(error.response?.data?.error || 'Failed to stop advertisement');
    } finally {
      setStoppingId(null);
    }
  };

  const handleApproveAd = async (adId) => {
    try {
      await axios.put(`/advertisements/${adId}/approve`);
      toast.success('Advertisement approved successfully!');
      fetchMyAdvertisements(); // Refresh list
    } catch (error) {
      console.error('Error approving advertisement:', error);
      toast.error(error.response?.data?.error || 'Failed to approve advertisement');
    }
  };

  const handleRejectAd = async (adId) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await axios.put(`/advertisements/${adId}/reject`, {
        rejectionReason: reason
      });
      toast.success('Advertisement rejected');
      fetchMyAdvertisements(); // Refresh list
    } catch (error) {
      console.error('Error rejecting advertisement:', error);
      toast.error(error.response?.data?.error || 'Failed to reject advertisement');
    }
  };

  const handleActivateAd = async (adId) => {
    try {
      await axios.put(`/advertisements/${adId}/status`, {
        status: 'active'
      });
      toast.success('Advertisement activated successfully!');
      fetchMyAdvertisements(); // Refresh list
    } catch (error) {
      console.error('Error activating advertisement:', error);
      toast.error(error.response?.data?.error || 'Failed to activate advertisement');
    }
  };

  const filteredAds = advertisements.filter(ad => {
    if (filter === 'all') return true;
    return ad.status === filter;
  });

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
      stopped: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    const icons = {
      photo: '🖼️',
      video: '🎥',
      slider: '🎞️'
    };
    return icons[type] || '📄';
  };

  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your advertisements...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">My Advertisements</h1>
              <p className="text-gray-600 mt-1">Manage and track your advertisement campaigns</p>
            </div>
            <button
              onClick={() => window.location.href = '/advertisement'}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              + Create New Ad
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Ads</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAds || 0}</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Ads</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeAds || 0}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Approval</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingAds || 0}</p>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">${stats.totalSpent || 0}</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filter:</span>
              <div className="flex space-x-2">
                {['all', 'active', 'pending', 'rejected', 'expired'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === status
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advertisements List */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {filteredAds.length === 0 ? (
          <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No advertisements found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't created any advertisements yet."
                : `You don't have any ${filter} advertisements.`}
            </p>
            <button
              onClick={() => window.location.href = '/advertisement'}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Your First Advertisement
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredAds.map(ad => (
              <div
                key={ad._id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Ad Preview */}
                <div className="relative h-48 bg-gray-100">
                  {ad.type === 'photo' && ad.content.mediaUrl && (
                    <img
                      src={ad.content.mediaUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {ad.type === 'video' && ad.content.mediaUrl && (
                    <video
                      src={ad.content.mediaUrl}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                  {ad.type === 'slider' && ad.content.slides && ad.content.slides[0] && (
                    <img
                      src={ad.content.slides[0].mediaUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 bg-white rounded-full px-3 py-1 text-sm font-medium shadow">
                    {getTypeIcon(ad.type)} {ad.type.charAt(0).toUpperCase() + ad.type.slice(1)}
                  </div>

                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 ${getStatusBadgeColor(ad.status)} rounded-full px-3 py-1 text-sm font-medium shadow`}>
                    {getStatusDisplayName(ad.status)}
                  </div>
                </div>

                {/* Ad Details */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{ad.title}</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span>📍 {ad.placement?.category?.replace(/_/g, ' ')}</span>
                      <span>{ad.schedule?.duration} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>📅 {formatDate(ad.schedule?.startDate)}</span>
                      <span className={ad.status === 'active' ? 'text-orange-600 font-medium' : ''}>
                        {ad.status === 'active' ? getDaysRemaining(ad.schedule?.endDate) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>💰 {formatCurrency(ad.pricing?.totalCost || 0)}</span>
                      <span>👁️ {ad.performance?.impressions || 0} views</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isAdmin ? (
                    // Admin Controls
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        {ad.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveAd(ad._id)}
                              className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleRejectAd(ad._id)}
                              className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        
                        {ad.status === 'active' && (
                          <button
                            onClick={() => handleStopAd(ad._id)}
                            disabled={stoppingId === ad._id}
                            className="flex-1 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-xs font-medium disabled:opacity-50"
                          >
                            {stoppingId === ad._id ? '⏳ Stopping...' : '⏸️ Stop'}
                          </button>
                        )}
                        
                        {(ad.status === 'inactive' || ad.status === 'stopped') && (
                          <button
                            onClick={() => handleActivateAd(ad._id)}
                            className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium"
                          >
                            ▶️ Activate
                          </button>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium">
                          📊 Analytics
                        </button>
                        <button
                          onClick={() => handleDeleteAd(ad._id)}
                          disabled={deletingId === ad._id}
                          className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium disabled:opacity-50"
                        >
                          {deletingId === ad._id ? '⏳ Deleting...' : '🗑️ Delete'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // User Controls
                    <div className="flex space-x-2">
                      <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                        View Details
                      </button>
                      {ad.status === 'active' && (
                        <button
                          onClick={() => handleStopAd(ad._id)}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          Stop
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAdvertisements;

