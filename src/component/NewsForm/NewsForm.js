import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from '../../helpers/axios';
import toast from 'react-hot-toast';
import TipTapEditor from '../TipTapEditor/TipTapEditor';
import ImageUploading from 'react-images-uploading';

const NewsForm = ({ news, onSuccess, onCancel }) => {
  const [content, setContent] = useState(news?.content || '');
  const [bannerImage, setBannerImage] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [newsSlug, setNewsSlug] = useState(news?.slug || null);
  const [sliderConfig, setSliderConfig] = useState({
    enabled: news?.sliderConfig?.enabled || false,
    autoplay: news?.sliderConfig?.autoplay || true,
    autoplayDelay: news?.sliderConfig?.autoplayDelay || 3000,
    showDots: news?.sliderConfig?.showDots || true,
    showArrows: news?.sliderConfig?.showArrows || true,
  });

  const token = window.localStorage.getItem("token");
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      title: news?.title || '',
      excerpt: news?.excerpt || '',
      category: news?.category || '',
      author: news?.author || '',
      tags: news?.tags?.join(', ') || '',
      status: news?.status || 'draft',
      metaTitle: news?.metaTitle || '',
      metaDescription: news?.metaDescription || '',
      isFeatured: news?.isFeatured || false,
    }
  });

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('news-categories');
        if (response.data.categories) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        // Use default categories if API fails
        setCategories([
          { name: 'Technology', icon: '💻' },
          { name: 'Sports', icon: '⚽' },
          { name: 'Business', icon: '💼' },
          { name: 'Entertainment', icon: '🎬' },
          { name: 'Health', icon: '🏥' },
          { name: 'Science', icon: '🔬' },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Banner image upload handler
  const onBannerImageChange = useCallback((imageList) => {
    setBannerImage(imageList);
  }, []);

  // Gallery images upload handler
  const onGalleryImagesChange = useCallback((imageList) => {
    setGalleryImages(imageList);
  }, []);

  // Form submission
  const onSubmit = async (data) => {
    if (!content.trim()) {
      toast.error('Please add some content to your news article');
      return;
    }

    if (bannerImage.length === 0 && !news?.bannerImage) {
      toast.error('Please upload a banner image');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', data.title);
      formData.append('excerpt', data.excerpt);
      formData.append('content', content);
      formData.append('category', data.category);
      formData.append('author', data.author);
      formData.append('tags', data.tags);
      formData.append('status', data.status);
      // readTime is now auto-calculated by the API
      formData.append('metaTitle', data.metaTitle);
      formData.append('metaDescription', data.metaDescription);
      formData.append('isFeatured', data.isFeatured);

      // Add slider configuration
      formData.append('sliderEnabled', sliderConfig.enabled);
      formData.append('sliderAutoplay', sliderConfig.autoplay);
      formData.append('sliderAutoplayDelay', sliderConfig.autoplayDelay);
      formData.append('sliderShowDots', sliderConfig.showDots);
      formData.append('sliderShowArrows', sliderConfig.showArrows);

      // Add banner image
      if (bannerImage.length > 0) {
        formData.append('bannerImage', bannerImage[0].file);
      } else if (news?.bannerImage) {
        formData.append('bannerImage', news.bannerImage);
      }

      // Add gallery images
      galleryImages.forEach((image, index) => {
        formData.append('galleryImages', image.file);
        formData.append(`galleryAlt[${index}]`, image.alt || '');
        formData.append(`galleryCaption[${index}]`, image.caption || '');
      });

      // Add existing gallery images if editing
      if (news?.galleryImages) {
        news.galleryImages.forEach((image, index) => {
          formData.append(`existingGalleryImages[${index}]`, image.url);
          formData.append(`existingGalleryAlt[${index}]`, image.alt || '');
          formData.append(`existingGalleryCaption[${index}]`, image.caption || '');
        });
      }

      const response = news 
        ? await axios.put(`news/${news._id}`, formData, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          })
        : await axios.post('news', formData, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });

      toast.success(news ? 'News updated successfully!' : 'News created successfully!');
      onSuccess(response.data.news);
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error(error.response?.data?.message || 'Failed to save news');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">
        {news ? 'Edit News' : 'Create New News'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            {...register('title', { required: 'Title is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter news title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt *
          </label>
          <textarea
            {...register('excerpt', { required: 'Excerpt is required' })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter news excerpt"
          />
          {errors.excerpt && (
            <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
          )}
        </div>

        {/* Banner Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banner Image *
          </label>
          <ImageUploading
            value={bannerImage}
            onChange={onBannerImageChange}
            maxNumber={1}
            dataURLKey="data_url"
          >
            {({
              imageList,
              onImageUpload,
              onImageRemoveAll,
              isDragging,
              dragProps,
            }) => (
              <div className="upload__image-wrapper">
                {news?.bannerImage && bannerImage.length === 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Current banner image:</p>
                    <img 
                      src={news.bannerImage} 
                      alt="Current banner" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                <button
                  type="button"
                  className={`w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onClick={onImageUpload}
                  {...dragProps}
                >
                  {imageList.length === 0 ? (
                    <div className="text-center">
                      <p className="text-gray-500">Click or drag to upload banner image</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <img 
                        src={imageList[0].data_url} 
                        alt="Banner" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                </button>
                {imageList.length > 0 && (
                  <button
                    type="button"
                    onClick={onImageRemoveAll}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            )}
          </ImageUploading>
        </div>

        {/* Gallery Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gallery Images
          </label>
          <ImageUploading
            multiple
            value={galleryImages}
            onChange={onGalleryImagesChange}
            maxNumber={20}
            dataURLKey="data_url"
          >
            {({
              imageList,
              onImageUpload,
              onImageRemove,
              isDragging,
              dragProps,
            }) => (
              <div className="upload__image-wrapper">
                {news?.galleryImages && galleryImages.length === 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Current gallery images:</p>
                    <div className="grid grid-cols-4 gap-4">
                      {news.galleryImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={image.url} 
                            alt={image.alt || `Gallery ${index + 1}`} 
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          {image.caption && (
                            <p className="text-xs text-gray-600 mt-1">{image.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  className={`w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onClick={onImageUpload}
                  {...dragProps}
                >
                  <div className="text-center">
                    <p className="text-gray-500">Click or drag to upload gallery images</p>
                    <p className="text-sm text-gray-400">Maximum 20 images</p>
                  </div>
                </button>
                {imageList.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {imageList.map((image, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={image.data_url} 
                          alt={`Gallery ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => onImageRemove(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ImageUploading>
        </div>

        {/* Slider Configuration */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Slider Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sliderEnabled"
                checked={sliderConfig.enabled}
                onChange={(e) => setSliderConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="sliderEnabled" className="text-sm font-medium">
                Enable Slider
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sliderAutoplay"
                checked={sliderConfig.autoplay}
                onChange={(e) => setSliderConfig(prev => ({ ...prev, autoplay: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="sliderAutoplay" className="text-sm font-medium">
                Autoplay
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sliderShowDots"
                checked={sliderConfig.showDots}
                onChange={(e) => setSliderConfig(prev => ({ ...prev, showDots: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="sliderShowDots" className="text-sm font-medium">
                Show Dots
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sliderShowArrows"
                checked={sliderConfig.showArrows}
                onChange={(e) => setSliderConfig(prev => ({ ...prev, showArrows: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="sliderShowArrows" className="text-sm font-medium">
                Show Arrows
              </label>
            </div>
          </div>
          {sliderConfig.enabled && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Autoplay Delay (ms)
              </label>
              <input
                type="number"
                value={sliderConfig.autoplayDelay}
                onChange={(e) => setSliderConfig(prev => ({ ...prev, autoplayDelay: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1000"
                step="500"
              />
            </div>
          )}
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <TipTapEditor
            content={content}
            onChange={setContent}
            newsSlug={newsSlug}
            placeholder="Write your news content here..."
          />
          <p className="mt-2 text-xs text-gray-500">
            💡 Click the 🖼️ Image button to upload images directly into your content
          </p>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            {loadingCategories ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                Loading categories...
              </div>
            ) : (
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            )}
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author *
            </label>
            <input
              {...register('author', { required: 'Author is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Author name"
            />
            {errors.author && (
              <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
            )}
          </div>
        </div>

        {/* Read Time Info & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Read Time
            </label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-blue-50 text-blue-700">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Auto-calculated from content</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Based on average reading speed of 200 words/minute
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            {...register('tags')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tags separated by commas"
          />
        </div>

        {/* SEO Fields */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">SEO Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                {...register('metaTitle')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SEO title (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                {...register('metaDescription')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SEO description (optional)"
              />
            </div>
          </div>
        </div>

        {/* Featured News */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isFeatured"
            {...register('isFeatured')}
            className="mr-2"
          />
          <label htmlFor="isFeatured" className="text-sm font-medium">
            Featured News
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (news ? 'Update News' : 'Create News')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewsForm;
