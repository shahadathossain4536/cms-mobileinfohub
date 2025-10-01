import React, { useState, useEffect } from 'react';
import AdvertisementTypeSelector from './components/AdvertisementTypeSelector';
import RunningAdsCounter from './components/RunningAdsCounter';
import PhotoAdvertisement from './types/PhotoAdvertisement';
import VideoAdvertisement from './types/VideoAdvertisement';
import MixedMediaSlider from './types/MixedMediaSlider';
import { advertisementTabData, getCategoryDisplayName } from './utils/advertisementUtils';

const Advertisement = () => {
  const [advertisementTab, setAdvertisementTab] = useState('ads_top_banner');
  const [selectedType, setSelectedType] = useState('photo');
  const [runningAdsCount, setRunningAdsCount] = useState(0);
  const [costEstimate, setCostEstimate] = useState(null);

  // Fetch running ads count on component mount and tab change
  useEffect(() => {
    fetchRunningAdsCount();
  }, [advertisementTab]);

  const fetchRunningAdsCount = async () => {
    try {
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:2000/api' 
        : 'https://deviceinfohub-server.vercel.app/api';
      
      const response = await fetch(`${apiUrl}/advertisements/public/running-count`);
      const data = await response.json();
      if (data.success) {
        setRunningAdsCount(data.data.runningAds);
      }
    } catch (error) {
      console.error('Error fetching running ads count:', error);
      // Set a default value if the API is not available
      setRunningAdsCount(0);
    }
  };

  const handleCostChange = (estimate) => {
    setCostEstimate(estimate);
  };

  const handleTabChange = (tab) => {
    setAdvertisementTab(tab);
    setSelectedType('photo'); // Reset to photo when changing tabs
    setCostEstimate(null); // Clear cost estimate
  };


  const renderAdvertisementType = () => {
    switch (selectedType) {
      case 'photo':
        return (
          <PhotoAdvertisement 
            placement={advertisementTab} 
            onCostChange={handleCostChange} 
          />
        );
      case 'video':
        return (
          <VideoAdvertisement 
            placement={advertisementTab} 
            onCostChange={handleCostChange} 
          />
        );
      case 'slider':
        return (
          <MixedMediaSlider 
            placement={advertisementTab} 
            onCostChange={handleCostChange} 
          />
        );
      default:
        return (
          <PhotoAdvertisement 
            placement={advertisementTab} 
            onCostChange={handleCostChange} 
          />
        );
    }
  };

  return (
    <div className="advertisement-container min-h-screen bg-gray-50">
      {/* Header with Running Ads Counter */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advertisement Management</h1>
              <p className="text-gray-600 mt-1">
                Create and manage your advertisements
              </p>
            </div>
            <RunningAdsCounter 
              count={runningAdsCount} 
              refreshInterval={30000}
              className="flex-shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center gap-4 py-4 overflow-x-auto">
            {advertisementTabData.map((item) => (
              <div
                key={item.id}
                onClick={() => handleTabChange(item.data)}
                className={`cursor-pointer px-6 py-3 rounded-lg flex items-center transition-all duration-200 ${
                  advertisementTab === item.data
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="text-lg mr-2">
                  {item.data === 'ads_top_banner' ? '🔝' :
                   item.data === 'ads_left_side_one_banner' ? '⬅️' :
                   item.data === 'ads_left_side_two_banner' ? '⬅️' :
                   '🔄'}
                </div>
                <div>
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto p-6">
            {/* Current Tab Info */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-600 mr-3">
                {advertisementTab === 'ads_top_banner' ? '🔝' :
                 advertisementTab === 'ads_left_side_one_banner' ? '⬅️' :
                 advertisementTab === 'ads_left_side_two_banner' ? '⬅️' :
                 '🔄'}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-blue-900">
                  {getCategoryDisplayName(advertisementTab)}
                </h2>
                <p className="text-sm text-blue-700">
                  {advertisementTab === 'ads_top_banner' && 'Highly visible top banner placement for maximum exposure'}
                  {advertisementTab === 'ads_left_side_one_banner' && 'Left sidebar banner placement for targeted visibility'}
                  {advertisementTab === 'ads_left_side_two_banner' && 'Secondary left sidebar placement for additional reach'}
                  {advertisementTab === 'ads_web_site_on_load' && 'Popup or overlay advertisement on page load'}
                </p>
              </div>
            </div>
          </div>
        </div>

            {/* Advertisement Type Selection */}
            <div className="mb-8">
              <AdvertisementTypeSelector
                selectedType={selectedType}
                onTypeChange={setSelectedType}
              />
            </div>

            {/* Advertisement Creation Form */}
            <div className="space-y-6">
              {renderAdvertisementType()}
            </div>
      </div>
    </div>
  );
};

export default Advertisement;