# Advertisement Frontend Implementation Plan

## Overview
This document outlines the comprehensive frontend implementation plan for the Advertisement system, building upon the existing codebase and integrating with the new backend APIs. The plan covers user interface enhancements, new features, and complete integration with the advertisement management system.

## Current Frontend Analysis

### Existing Components
1. **Advertisement.js**: Main advertisement component with tab navigation
2. **AdsTopBanner.js**: Top banner advertisement creation (currently only slider)

### Current Features
- ✅ Tab-based navigation for different advertisement placements
- ✅ Basic photo/video/slider option selection
- ✅ Image slider creation with ImageBB upload
- ✅ Form validation using react-hook-form
- ✅ Toast notifications for user feedback

### Current Limitations
- ❌ Only slider type is fully implemented
- ❌ Photo and video options are placeholder
- ❌ Uses external ImageBB service
- ❌ No user request system
- ❌ No cost calculation
- ❌ No slot availability checking
- ❌ No running ads counter
- ❌ No admin approval workflow

## Implementation Plan

### Phase 1: Enhanced Advertisement Creation (Week 1)

#### 1.1 Create New Components

**File Structure:**
```
src/Pages/Advertisement/
├── Advertisement.js (Enhanced)
├── components/
│   ├── AdvertisementTypeSelector.js
│   ├── MediaUploader.js
│   ├── CostCalculator.js
│   ├── SlotAvailability.js
│   ├── AdvertisementPreview.js
│   └── RunningAdsCounter.js
├── types/
│   ├── PhotoAdvertisement.js
│   ├── VideoAdvertisement.js
│   ├── SliderAdvertisement.js
│   └── MixedMediaSlider.js
└── utils/
    ├── advertisementUtils.js
    ├── fileUploadUtils.js
    └── costCalculationUtils.js
```

#### 1.2 Enhanced Advertisement Component

```javascript
// Enhanced Advertisement.js
import React, { useState, useEffect } from 'react';
import { AdvertisementTypeSelector } from './components/AdvertisementTypeSelector';
import { MediaUploader } from './components/MediaUploader';
import { CostCalculator } from './components/CostCalculator';
import { SlotAvailability } from './components/SlotAvailability';
import { RunningAdsCounter } from './components/RunningAdsCounter';
import PhotoAdvertisement from './types/PhotoAdvertisement';
import VideoAdvertisement from './types/VideoAdvertisement';
import SliderAdvertisement from './types/SliderAdvertisement';

const Advertisement = () => {
  const [advertisementTab, setAdvertisementTab] = useState('ads_top_banner');
  const [selectedType, setSelectedType] = useState('photo');
  const [runningAdsCount, setRunningAdsCount] = useState(0);
  const [slotAvailability, setSlotAvailability] = useState(null);
  const [costEstimate, setCostEstimate] = useState(null);

  // Fetch running ads count on component mount
  useEffect(() => {
    fetchRunningAdsCount();
    checkSlotAvailability();
  }, [advertisementTab]);

  const fetchRunningAdsCount = async () => {
    try {
      const response = await axios.get('/api/advertisements/public/running-count');
      setRunningAdsCount(response.data.data.runningAds);
    } catch (error) {
      console.error('Error fetching running ads count:', error);
    }
  };

  const checkSlotAvailability = async () => {
    try {
      const response = await axios.get('/api/advertisement-slots/availability', {
        params: {
          category: advertisementTab,
          position: getPositionFromCategory(advertisementTab)
        }
      });
      setSlotAvailability(response.data.data);
    } catch (error) {
      console.error('Error checking slot availability:', error);
    }
  };

  const calculateCost = async (duration, type) => {
    try {
      const response = await axios.post('/api/user/advertisements/calculate-cost', {
        category: advertisementTab,
        position: getPositionFromCategory(advertisementTab),
        duration,
        type
      });
      setCostEstimate(response.data.data);
    } catch (error) {
      console.error('Error calculating cost:', error);
    }
  };

  const renderAdvertisementType = () => {
    switch (selectedType) {
      case 'photo':
        return <PhotoAdvertisement placement={advertisementTab} onCostChange={calculateCost} />;
      case 'video':
        return <VideoAdvertisement placement={advertisementTab} onCostChange={calculateCost} />;
      case 'slider':
        return <SliderAdvertisement placement={advertisementTab} onCostChange={calculateCost} />;
      default:
        return null;
    }
  };

  return (
    <div className="advertisement-container">
      {/* Running Ads Counter */}
      <RunningAdsCounter count={runningAdsCount} />
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        {advertisementTabData.map((item) => (
          <div
            key={item.id}
            onClick={() => setAdvertisementTab(item.data)}
            className={`tab-item ${advertisementTab === item.data ? 'active' : ''}`}
          >
            <span>{item.title}</span>
          </div>
        ))}
      </div>

      {/* Slot Availability Status */}
      <SlotAvailability availability={slotAvailability} />

      {/* Advertisement Type Selection */}
      <AdvertisementTypeSelector 
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      {/* Cost Calculator */}
      {costEstimate && <CostCalculator estimate={costEstimate} />}

      {/* Advertisement Creation Form */}
      <div className="advertisement-form">
        {renderAdvertisementType()}
      </div>
    </div>
  );
};
```

#### 1.3 Advertisement Type Components

**PhotoAdvertisement.js**
```javascript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MediaUploader } from '../components/MediaUploader';
import { AdvertisementPreview } from '../components/AdvertisementPreview';

const PhotoAdvertisement = ({ placement, onCostChange }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const onSubmit = async (data) => {
    if (!uploadedImage) {
      toast.error('Please upload an image');
      return;
    }

    setIsUploading(true);
    try {
      const advertisementData = {
        title: data.title,
        type: 'photo',
        placement: {
          category: placement,
          position: getPositionFromCategory(placement)
        },
        content: {
          mediaUrl: uploadedImage.url,
          mediaType: 'image'
        },
        schedule: {
          startDate: data.startDate,
          duration: parseInt(data.duration)
        }
      };

      const response = await axios.post('/api/advertisements', advertisementData);
      toast.success('Photo advertisement created successfully!');
      
      // Reset form
      setUploadedImage(null);
    } catch (error) {
      console.error('Error creating photo advertisement:', error);
      toast.error('Error creating advertisement');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="photo-advertisement">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Advertisement Title</label>
          <input
            {...register('title', { required: 'Title is required' })}
            placeholder="Enter advertisement title"
          />
          {errors.title && <span className="error">{errors.title.message}</span>}
        </div>

        <div className="form-group">
          <label>Upload Image</label>
          <MediaUploader
            type="image"
            onUpload={setUploadedImage}
            placement={placement}
          />
        </div>

        <div className="form-group">
          <label>Duration (days)</label>
          <input
            type="number"
            min="1"
            max="365"
            {...register('duration', { 
              required: 'Duration is required',
              min: { value: 1, message: 'Minimum 1 day' }
            })}
            onChange={(e) => onCostChange(e.target.value, 'photo')}
          />
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            {...register('startDate', { required: 'Start date is required' })}
          />
        </div>

        {uploadedImage && (
          <AdvertisementPreview 
            type="photo"
            mediaUrl={uploadedImage.url}
            title={watch('title')}
          />
        )}

        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Creating...' : 'Create Photo Advertisement'}
        </button>
      </form>
    </div>
  );
};
```

**VideoAdvertisement.js**
```javascript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MediaUploader } from '../components/MediaUploader';
import { AdvertisementPreview } from '../components/AdvertisementPreview';

const VideoAdvertisement = ({ placement, onCostChange }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const onSubmit = async (data) => {
    if (!uploadedVideo) {
      toast.error('Please upload a video');
      return;
    }

    setIsUploading(true);
    try {
      const advertisementData = {
        title: data.title,
        type: 'video',
        placement: {
          category: placement,
          position: getPositionFromCategory(placement)
        },
        content: {
          mediaUrl: uploadedVideo.url,
          mediaType: 'video'
        },
        schedule: {
          startDate: data.startDate,
          duration: parseInt(data.duration)
        }
      };

      const response = await axios.post('/api/advertisements', advertisementData);
      toast.success('Video advertisement created successfully!');
      
      setUploadedVideo(null);
    } catch (error) {
      console.error('Error creating video advertisement:', error);
      toast.error('Error creating advertisement');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="video-advertisement">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Similar structure as PhotoAdvertisement but for video */}
        <div className="form-group">
          <label>Upload Video</label>
          <MediaUploader
            type="video"
            onUpload={setUploadedVideo}
            placement={placement}
          />
        </div>

        {/* Rest of the form fields */}
        
        {uploadedVideo && (
          <AdvertisementPreview 
            type="video"
            mediaUrl={uploadedVideo.url}
            title={watch('title')}
          />
        )}

        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Creating...' : 'Create Video Advertisement'}
        </button>
      </form>
    </div>
  );
};
```

**MixedMediaSlider.js** (Enhanced Slider)
```javascript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MediaUploader } from '../components/MediaUploader';
import { AdvertisementPreview } from '../components/AdvertisementPreview';

const MixedMediaSlider = ({ placement, onCostChange }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleMediaUpload = (newMedia) => {
    setUploadedMedia(prev => [...prev, ...newMedia]);
  };

  const removeMedia = (index) => {
    setUploadedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const reorderMedia = (fromIndex, toIndex) => {
    const newMedia = [...uploadedMedia];
    const [removed] = newMedia.splice(fromIndex, 1);
    newMedia.splice(toIndex, 0, removed);
    setUploadedMedia(newMedia);
  };

  const onSubmit = async (data) => {
    if (uploadedMedia.length === 0) {
      toast.error('Please upload at least one media file');
      return;
    }

    setIsUploading(true);
    try {
      const slides = uploadedMedia.map((media, index) => ({
        mediaUrl: media.url,
        mediaType: media.type,
        title: data[`slideTitle${index}`] || media.originalName,
        description: data[`slideDescription${index}`] || '',
        linkUrl: data[`slideLink${index}`] || '',
        order: index + 1,
        filename: media.filename,
        fileSize: media.size
      }));

      const advertisementData = {
        title: data.title,
        type: 'slider',
        placement: {
          category: placement,
          position: getPositionFromCategory(placement)
        },
        content: {
          slides: slides
        },
        schedule: {
          startDate: data.startDate,
          duration: parseInt(data.duration)
        }
      };

      const response = await axios.post('/api/advertisements', advertisementData);
      toast.success('Mixed media slider created successfully!');
      
      setUploadedMedia([]);
    } catch (error) {
      console.error('Error creating mixed media slider:', error);
      toast.error('Error creating advertisement');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mixed-media-slider">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Advertisement Title</label>
          <input
            {...register('title', { required: 'Title is required' })}
            placeholder="Enter advertisement title"
          />
        </div>

        <div className="form-group">
          <label>Upload Media (Images & Videos)</label>
          <MediaUploader
            type="mixed"
            onUpload={handleMediaUpload}
            placement={placement}
            multiple={true}
          />
        </div>

        {/* Media Preview and Management */}
        {uploadedMedia.length > 0 && (
          <div className="media-management">
            <h4>Media Preview & Management</h4>
            {uploadedMedia.map((media, index) => (
              <div key={index} className="media-item">
                <div className="media-preview">
                  {media.type === 'image' ? (
                    <img src={media.url} alt={media.originalName} />
                  ) : (
                    <video src={media.url} controls />
                  )}
                </div>
                
                <div className="media-details">
                  <input
                    placeholder="Slide title"
                    {...register(`slideTitle${index}`)}
                  />
                  <input
                    placeholder="Slide description"
                    {...register(`slideDescription${index}`)}
                  />
                  <input
                    placeholder="Link URL"
                    {...register(`slideLink${index}`)}
                  />
                </div>

                <div className="media-actions">
                  <button type="button" onClick={() => removeMedia(index)}>
                    Remove
                  </button>
                  <button type="button" onClick={() => reorderMedia(index, index - 1)}>
                    Move Up
                  </button>
                  <button type="button" onClick={() => reorderMedia(index, index + 1)}>
                    Move Down
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="form-group">
          <label>Duration (days)</label>
          <input
            type="number"
            min="1"
            max="365"
            {...register('duration', { 
              required: 'Duration is required',
              min: { value: 1, message: 'Minimum 1 day' }
            })}
            onChange={(e) => onCostChange(e.target.value, 'slider')}
          />
        </div>

        <button type="submit" disabled={isUploading || uploadedMedia.length === 0}>
          {isUploading ? 'Creating...' : 'Create Mixed Media Slider'}
        </button>
      </form>
    </div>
  );
};
```

### Phase 2: User Request System (Week 2)

#### 2.1 Advertisement Request Components

**AdvertisementRequest.js**
```javascript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const AdvertisementRequest = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const requestData = {
        title: data.title,
        type: data.type,
        placement: {
          category: data.category,
          position: data.position
        },
        requestedDuration: parseInt(data.duration),
        requestedStartDate: data.startDate,
        companyName: data.companyName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        targetAudience: data.targetAudience,
        specialRequirements: data.specialRequirements
      };

      const response = await axios.post('/api/advertisement-requests', requestData);
      toast.success('Advertisement request submitted successfully!');
      
      // Reset form
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Error submitting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="advertisement-request">
      <h2>Submit Advertisement Request</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form fields for advertisement request */}
        <div className="form-group">
          <label>Company Name</label>
          <input {...register('companyName', { required: 'Company name is required' })} />
        </div>

        <div className="form-group">
          <label>Contact Email</label>
          <input 
            type="email" 
            {...register('contactEmail', { 
              required: 'Contact email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email format'
              }
            })} 
          />
        </div>

        {/* More form fields */}
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};
```

#### 2.2 User Dashboard Components

**UserAdvertisementDashboard.js**
```javascript
import React, { useState, useEffect } from 'react';

const UserAdvertisementDashboard = () => {
  const [userAds, setUserAds] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [adsResponse, requestsResponse] = await Promise.all([
        axios.get('/api/user/advertisements/my-ads'),
        axios.get('/api/advertisement-requests/my-requests')
      ]);
      
      setUserAds(adsResponse.data.data);
      setUserRequests(requestsResponse.data.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-dashboard">
      <h2>My Advertisements</h2>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Advertisements</h3>
          <p>{userAds.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Advertisements</h3>
          <p>{userAds.filter(ad => ad.status === 'active').length}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Requests</h3>
          <p>{userRequests.filter(req => req.status === 'pending').length}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="ads-section">
          <h3>My Advertisements</h3>
          {userAds.map(ad => (
            <AdvertisementCard key={ad._id} advertisement={ad} />
          ))}
        </div>

        <div className="requests-section">
          <h3>My Requests</h3>
          {userRequests.map(request => (
            <RequestCard key={request._id} request={request} />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### Phase 3: Admin Dashboard (Week 3)

#### 3.1 Admin Advertisement Management

**AdminAdvertisementDashboard.js**
```javascript
import React, { useState, useEffect } from 'react';

const AdminAdvertisementDashboard = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [adsResponse, requestsResponse, analyticsResponse] = await Promise.all([
        axios.get('/api/advertisements'),
        axios.get('/api/advertisement-requests'),
        axios.get('/api/advertisements/performance/analytics')
      ]);
      
      setAdvertisements(adsResponse.data.data);
      setRequests(requestsResponse.data.data);
      setAnalytics(analyticsResponse.data.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId) => {
    try {
      await axios.put(`/api/advertisement-requests/${requestId}/approve`, {
        adminNotes: 'Approved for publication'
      });
      toast.success('Request approved successfully!');
      fetchAdminData();
    } catch (error) {
      toast.error('Error approving request');
    }
  };

  const rejectRequest = async (requestId, reason) => {
    try {
      await axios.put(`/api/advertisement-requests/${requestId}/reject`, {
        rejectionReason: reason,
        adminNotes: 'Request rejected'
      });
      toast.success('Request rejected');
      fetchAdminData();
    } catch (error) {
      toast.error('Error rejecting request');
    }
  };

  const stopAdvertisement = async (adId) => {
    try {
      await axios.put(`/api/advertisements/${adId}/stop`);
      toast.success('Advertisement stopped successfully!');
      fetchAdminData();
    } catch (error) {
      toast.error('Error stopping advertisement');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Advertisement Dashboard</h2>
      
      {/* Analytics Overview */}
      {analytics && (
        <div className="analytics-overview">
          <h3>Analytics Overview</h3>
          <div className="analytics-cards">
            <div className="analytics-card">
              <h4>Running Advertisements</h4>
              <p>{analytics.runningAds}</p>
            </div>
            <div className="analytics-card">
              <h4>Total Impressions</h4>
              <p>{analytics.totalImpressions}</p>
            </div>
            <div className="analytics-card">
              <h4>Total Clicks</h4>
              <p>{analytics.totalClicks}</p>
            </div>
            <div className="analytics-card">
              <h4>Total Revenue</h4>
              <p>${analytics.totalRevenue}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      <div className="pending-requests">
        <h3>Pending Requests</h3>
        {requests.filter(req => req.status === 'pending').map(request => (
          <RequestManagementCard 
            key={request._id} 
            request={request}
            onApprove={approveRequest}
            onReject={rejectRequest}
          />
        ))}
      </div>

      {/* Advertisement Management */}
      <div className="advertisement-management">
        <h3>All Advertisements</h3>
        {advertisements.map(ad => (
          <AdvertisementManagementCard 
            key={ad._id} 
            advertisement={ad}
            onStop={stopAdvertisement}
          />
        ))}
      </div>
    </div>
  );
};
```

### Phase 4: Utility Components (Week 4)

#### 4.1 Reusable Components

**MediaUploader.js**
```javascript
import React, { useState } from 'react';

const MediaUploader = ({ 
  type = 'image', 
  onUpload, 
  placement, 
  multiple = false,
  maxFiles = 5 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      if (type === 'mixed') {
        files.forEach(file => {
          if (file.type.startsWith('image/')) {
            formData.append('images', file);
          } else if (file.type.startsWith('video/')) {
            formData.append('videos', file);
          }
        });
      } else {
        files.forEach(file => formData.append(type, file));
      }
      
      formData.append('placement', placement);

      const response = await axios.post(`/api/uploads/${type === 'mixed' ? 'mixed-media' : type}`, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.data.success) {
        onUpload(response.data.data.files);
        toast.success(`${files.length} file(s) uploaded successfully!`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getAcceptTypes = () => {
    switch (type) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'mixed':
        return 'image/*,video/*';
      default:
        return '*';
    }
  };

  return (
    <div className="media-uploader">
      <div className="upload-area">
        <input
          type="file"
          accept={getAcceptTypes()}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={isUploading}
          className="file-input"
        />
        
        <div className="upload-placeholder">
          {isUploading ? (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p>Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <div className="upload-content">
              <div className="upload-icon">📁</div>
              <p>Click to upload {type === 'mixed' ? 'images and videos' : type}</p>
              {multiple && <p>Maximum {maxFiles} files</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

**CostCalculator.js**
```javascript
import React, { useState, useEffect } from 'react';

const CostCalculator = ({ placement, duration, type, onCostChange }) => {
  const [costEstimate, setCostEstimate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (duration && type && placement) {
      calculateCost();
    }
  }, [placement, duration, type]);

  const calculateCost = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/user/advertisements/calculate-cost', {
        category: placement,
        position: getPositionFromCategory(placement),
        duration: parseInt(duration),
        type
      });

      setCostEstimate(response.data.data);
      onCostChange(response.data.data);
    } catch (error) {
      console.error('Error calculating cost:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!costEstimate) return null;

  return (
    <div className="cost-calculator">
      <h4>Cost Estimate</h4>
      <div className="cost-breakdown">
        <div className="cost-item">
          <span>Base Rate:</span>
          <span>${costEstimate.pricing.baseCost}</span>
        </div>
        <div className="cost-item">
          <span>Duration:</span>
          <span>{duration} days</span>
        </div>
        <div className="cost-item">
          <span>Type Multiplier:</span>
          <span>{type}</span>
        </div>
        <div className="cost-item total">
          <span>Total Cost:</span>
          <span>${costEstimate.pricing.totalCost}</span>
        </div>
      </div>
      
      <div className="availability-status">
        <span className={`status ${costEstimate.availability.isAvailable ? 'available' : 'unavailable'}`}>
          {costEstimate.availability.message}
        </span>
      </div>
    </div>
  );
};
```

**RunningAdsCounter.js**
```javascript
import React, { useState, useEffect } from 'react';

const RunningAdsCounter = ({ count, refreshInterval = 30000 }) => {
  const [currentCount, setCurrentCount] = useState(count || 0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const fetchRunningCount = async () => {
      try {
        const response = await axios.get('/api/advertisements/public/running-count');
        setCurrentCount(response.data.data.runningAds);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching running ads count:', error);
      }
    };

    // Fetch immediately
    fetchRunningCount();

    // Set up interval for auto-refresh
    const interval = setInterval(fetchRunningCount, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="running-ads-counter">
      <div className="counter-card">
        <div className="counter-icon">📊</div>
        <div className="counter-content">
          <h3>Currently Running</h3>
          <p className="counter-number">{currentCount}</p>
          <p className="counter-label">Advertisements</p>
        </div>
        <div className="last-updated">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
```

## Implementation Timeline

### Week 1: Core Advertisement Creation
- [ ] Enhanced Advertisement component with tab navigation
- [ ] PhotoAdvertisement component with local file upload
- [ ] VideoAdvertisement component with local file upload
- [ ] MixedMediaSlider component with mixed media support
- [ ] MediaUploader utility component
- [ ] CostCalculator component
- [ ] RunningAdsCounter component

### Week 2: User Request System
- [ ] AdvertisementRequest component
- [ ] UserAdvertisementDashboard component
- [ ] Request management components
- [ ] User authentication integration
- [ ] Request status tracking

### Week 3: Admin Dashboard
- [ ] AdminAdvertisementDashboard component
- [ ] Advertisement management components
- [ ] Request approval/rejection workflow
- [ ] Analytics and reporting components
- [ ] Admin authentication integration

### Week 4: Polish & Optimization
- [ ] Error handling and validation
- [ ] Loading states and user feedback
- [ ] Responsive design optimization
- [ ] Performance optimization
- [ ] Testing and bug fixes

## File Structure Summary

```
src/Pages/Advertisement/
├── Advertisement.js (Main component)
├── AdvertisementRequest.js (User request form)
├── UserAdvertisementDashboard.js (User dashboard)
├── AdminAdvertisementDashboard.js (Admin dashboard)
├── components/
│   ├── AdvertisementTypeSelector.js
│   ├── MediaUploader.js
│   ├── CostCalculator.js
│   ├── SlotAvailability.js
│   ├── AdvertisementPreview.js
│   ├── RunningAdsCounter.js
│   ├── AdvertisementCard.js
│   ├── RequestCard.js
│   └── AdvertisementManagementCard.js
├── types/
│   ├── PhotoAdvertisement.js
│   ├── VideoAdvertisement.js
│   ├── SliderAdvertisement.js
│   └── MixedMediaSlider.js
├── utils/
│   ├── advertisementUtils.js
│   ├── fileUploadUtils.js
│   ├── costCalculationUtils.js
│   └── validationUtils.js
└── styles/
    ├── advertisement.css
    ├── components.css
    └── responsive.css
```

## Key Features to Implement

### User Features
- ✅ Advertisement creation (Photo, Video, Mixed Media Slider)
- ✅ Cost calculation and slot availability
- ✅ Advertisement request submission
- ✅ User dashboard with statistics
- ✅ Running advertisements counter

### Admin Features
- ✅ Advertisement management dashboard
- ✅ Request approval/rejection workflow
- ✅ Instant advertisement stopping
- ✅ Analytics and reporting
- ✅ Revenue tracking

### Technical Features
- ✅ Local file upload system
- ✅ Mixed media support (images + videos)
- ✅ Real-time data updates
- ✅ Form validation and error handling
- ✅ Responsive design
- ✅ Loading states and user feedback

This comprehensive plan provides a complete roadmap for implementing the advertisement frontend system with all the features requested in the backend implementation.

