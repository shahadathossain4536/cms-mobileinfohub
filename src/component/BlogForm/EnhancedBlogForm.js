import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from '../../helpers/axios';
import toast from 'react-hot-toast';
import TipTapEditor from '../TipTapEditor/TipTapEditor';
import ImageUploading from 'react-images-uploading';

const EnhancedBlogForm = ({ blog, onSuccess, onCancel }) => {
  const [content, setContent] = useState(blog?.content || '');
  const [bannerImage, setBannerImage] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [blogSlug, setBlogSlug] = useState(blog?.slug || null);
  const [sliderConfig, setSliderConfig] = useState({
    enabled: blog?.sliderConfig?.enabled || false,
    autoplay: blog?.sliderConfig?.autoplay || true,
    autoplayDelay: blog?.sliderConfig?.autoplayDelay || 3000,
    showDots: blog?.sliderConfig?.showDots || true,
    showArrows: blog?.sliderConfig?.showArrows || true,
  });

  const token = window.localStorage.getItem("token");
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      title: blog?.title || '',
      excerpt: blog?.excerpt || '',
      category: blog?.category || '',
      author: blog?.author || '',
      tags: blog?.tags?.join(', ') || '',
      status: blog?.status || 'draft',
      metaTitle: blog?.metaTitle || '',
      metaDescription: blog?.metaDescription || '',
      isFeatured: blog?.isFeatured || false,
    }
  });

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('blog-categories');
        if (response.data.categories) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        // Use default categories if API fails
        setCategories([
          { name: 'Technology', icon: '💻' },
          { name: 'Tutorial', icon: '📚' },
          { name: 'Review', icon: '⭐' },
          { name: 'Guide', icon: '🗺️' },
          { name: 'Tips', icon: '💡' },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const onBannerImageChange = useCallback((imageList) => {
    setBannerImage(imageList);
  }, []);

  const onGalleryImagesChange = useCallback((imageList) => {
    setGalleryImages(imageList);
  }, []);

  const onSubmit = async (data) => {
    console.log('=== Form Submission Debug ===');
    console.log('Banner Image State:', bannerImage);
    console.log('Gallery Images State:', galleryImages);
    console.log('Content:', content.substring(0, 100));
    
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    if (bannerImage.length === 0 && !blog?.bannerImage) {
      console.error('❌ Banner image validation failed');
      console.log('bannerImage.length:', bannerImage.length);
      console.log('blog?.bannerImage:', blog?.bannerImage);
      toast.error('Banner image is required. Please upload a banner image.');
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
      formData.append('metaTitle', data.metaTitle);
      formData.append('metaDescription', data.metaDescription);
      formData.append('isFeatured', data.isFeatured);

      // Add slider config
      formData.append('sliderEnabled', sliderConfig.enabled);
      formData.append('sliderAutoplay', sliderConfig.autoplay);
      formData.append('sliderAutoplayDelay', sliderConfig.autoplayDelay);
      formData.append('sliderShowDots', sliderConfig.showDots);
      formData.append('sliderShowArrows', sliderConfig.showArrows);

      // Add banner image
      if (bannerImage.length > 0 && bannerImage[0].file) {
        console.log('✅ Adding banner image to FormData:', bannerImage[0].file.name);
        formData.append('bannerImage', bannerImage[0].file);
      } else {
        console.warn('⚠️ No banner image file found');
      }

      // Add gallery images
      galleryImages.forEach((image, index) => {
        formData.append('galleryImages', image.file);
        formData.append(`galleryAlt[${index}]`, image.alt || '');
        formData.append(`galleryCaption[${index}]`, image.caption || '');
      });

      let response;
      if (blog) {
        // Update existing blog
        response = await axios.put(`blogs/${blog._id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create new blog
        response = await axios.post('blogs', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data) {
        toast.success(blog ? 'Blog updated successfully!' : 'Blog created successfully!');
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error(error.response?.data?.message || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h2>
        <p className="text-gray-600 mt-1">
          {blog ? 'Update your blog post details' : 'Fill in the details to create a new blog post'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title & Excerpt */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter blog post title..."
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt *
                </label>
                <textarea
                  {...register('excerpt', { required: 'Excerpt is required' })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write a brief summary of the blog post..."
                />
                {errors.excerpt && (
                  <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
                )}
              </div>
            </div>

            {/* Banner Image */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
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
                    {blog?.bannerImage && bannerImage.length === 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Current banner image:</p>
                        <img 
                          src={blog.bannerImage} 
                          alt="Current banner" 
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      className={`w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
                        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={onImageUpload}
                      {...dragProps}
                    >
                      {imageList.length === 0 ? (
                        <div className="text-center">
                          <div className="text-4xl mb-2">📸</div>
                          <p className="text-gray-500 font-medium">Upload Banner Image</p>
                          <p className="text-sm text-gray-400">Click or drag to upload</p>
                        </div>
                      ) : (
                        <div className="relative w-full h-full">
                          <img 
                            src={imageList[0].data_url} 
                            alt="Banner" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={onImageRemoveAll}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </ImageUploading>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Content *
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <TipTapEditor
                  content={content}
                  onChange={setContent}
                  blogSlug={blogSlug}
                  placeholder="Write your blog content here..."
                />
              </div>
              <p className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                💡 <span>Click the 🖼️ Image button to upload images directly into your content</span>
              </p>
            </div>

          </div>

          {/* Right Column - Settings & Metadata */}
          <div className="space-y-6">
            
            {/* Basic Information Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                📋 Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  {loadingCategories ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                  <input 
                    {...register('author', { required: 'Author is required' })} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Author name" 
                  />
                  {errors.author && (
                    <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select 
                    {...register('status', { required: 'Status is required' })} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">📝 Draft</option>
                    <option value="published">✅ Published</option>
                    <option value="archived">🗄️ Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <input 
                    {...register('tags')} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="tech, tutorial, guide (comma separated)" 
                  />
                </div>

                <div className="flex items-center">
                  <input 
                    {...register('isFeatured')} 
                    type="checkbox" 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    ⭐ Featured Blog Post
                  </label>
                </div>
              </div>
            </div>

            {/* Read Time Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                ⏱️ Read Time
              </h3>
              <div className="flex items-center gap-2 text-blue-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Auto-calculated from content</span>
              </div>
              <p className="mt-1 text-xs text-blue-600">Based on average reading speed of 200 words/minute</p>
            </div>

            {/* Gallery Images */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🖼️ Gallery Images
              </h3>
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
                    {blog?.galleryImages && galleryImages.length === 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Current gallery images:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {blog.galleryImages.map((image, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={image.url} 
                                alt={image.alt || `Gallery ${index + 1}`} 
                                className="w-full h-20 object-cover rounded-lg border"
                              />
                              {image.caption && (
                                <p className="text-xs text-gray-600 mt-1 truncate">{image.caption}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      className={`w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
                        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={onImageUpload}
                      {...dragProps}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">📷</div>
                        <p className="text-sm text-gray-500">Add Gallery Images</p>
                        <p className="text-xs text-gray-400">Max 20 images</p>
                      </div>
                    </button>
                    {imageList.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {imageList.map((image, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <img 
                              src={image.data_url} 
                              alt={`Gallery ${index + 1}`} 
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Alt text (optional)"
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded mb-1"
                                value={image.alt || ''}
                                onChange={(e) => {
                                  const newImageList = [...imageList];
                                  newImageList[index].alt = e.target.value;
                                  setGalleryImages(newImageList);
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Caption (optional)"
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                value={image.caption || ''}
                                onChange={(e) => {
                                  const newImageList = [...imageList];
                                  newImageList[index].caption = e.target.value;
                                  setGalleryImages(newImageList);
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => onImageRemove(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
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
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🎠 Slider Configuration
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sliderConfig.enabled}
                    onChange={(e) => setSliderConfig({...sliderConfig, enabled: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Enable Gallery Slider
                  </label>
                </div>
                {sliderConfig.enabled && (
                  <>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sliderConfig.autoplay}
                        onChange={(e) => setSliderConfig({...sliderConfig, autoplay: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Autoplay
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sliderConfig.showDots}
                        onChange={(e) => setSliderConfig({...sliderConfig, showDots: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Show Dots
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sliderConfig.showArrows}
                        onChange={(e) => setSliderConfig({...sliderConfig, showArrows: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Show Arrows
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Autoplay Delay (ms)</label>
                      <input
                        type="number"
                        value={sliderConfig.autoplayDelay}
                        onChange={(e) => setSliderConfig({...sliderConfig, autoplayDelay: parseInt(e.target.value)})}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        min="1000"
                        step="500"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🔍 SEO Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <input 
                    {...register('metaTitle')} 
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="SEO title (optional)" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea 
                    {...register('metaDescription')} 
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="SEO description (optional)" 
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              blog ? 'Update Blog Post' : 'Create Blog Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedBlogForm;
