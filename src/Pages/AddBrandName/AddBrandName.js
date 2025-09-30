import axios from '../../helpers/axios';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster, useToaster } from 'react-hot-toast';

const AddBrandName = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const token = window.localStorage.getItem("token");
  //  const toaster = useToaster();


  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const previewImage = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreviewUrl(null);
    }
  };
  // Removed external ImgBB upload. We will upload directly to our backend.

  const onSubmit = async (data) => {
    try {
      if (!selectedImage) {
        toast.error('Please select an image to upload.', { duration: 4000 });
        return;
      }

      const formData = new FormData();
      formData.append('name', String(data.name || '').toLowerCase());
      formData.append('brandBannerImg', selectedImage);
      if (data.order !== undefined && data.order !== null && String(data.order).trim() !== '') {
        formData.append('order', Number(data.order) || 0);
      }

      const response = await axios.post('brandName', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Let the browser set correct Content-Type with boundary for multipart
        },
      });

      toast.success('Brand name added successfully!', { duration: 3000 });
      // Reset state
      setSelectedImage(null);
      setImagePreviewUrl(null);
      console.log(response.data);
    } catch (error) {
      toast.error(error?.response?.data?.error ? error.response.data.error : 'Error adding brand name. Please try again.');
      console.error('Error submitting data:', error?.response?.data || error);
    }
  };
  return (
    <div className='max-w-[600px] w-full border-[2px] rounded-md'>




      <h2 className='py-3 text-center text-xl'>Add Brand Name</h2>
      <div className='w-full flex justify-center items-center'>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='w-full max-w-[560px]  flex flex-col justify-center items-center'
        >
          <div className='w-full'>
            <input
              className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full'
              type='text'
              {...register('name', {
                required: {
                  value: true,
                  message: 'Enter Your Brand Name',
                },
              })}
            />
            <label className='label'>
              {errors.name?.type === 'required' && (
                <span className='label-text-alt text-red-600'>
                  {errors?.name?.message}
                </span>
              )}
            </label>
          </div>

          {/* Optional manual order override */}
          <div className='w-full mt-2'>
            <input
              className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full'
              type='number'
              placeholder='Order (optional)'
              {...register('order', {
                min: { value: 0, message: 'Order must be >= 0' },
                valueAsNumber: true,
              })}
            />
            <label className='label'>
              {errors.order && (
                <span className='label-text-alt text-red-600'>
                  {errors.order.message}
                </span>
              )}
            </label>
          </div>

          <div className="w-full flex items-center gap-5 justify-between">
            <div className="max-w-[150px] w-full h-[200px]">
              <input
                type="file"
                accept="image/*"
                {...register("bannerImage", {
                  required: "Please select an image",
                })}
                className="max-w-[150px] w-full h-[200px] relative "
                onChange={(e) => {
                  setSelectedImage(e.target.files[0]);
                  previewImage(e.target.files[0]);
                }}
              />
              {errors.image && (
                <p className="error-message">{errors.image.message}</p>
              )}
            </div>

            <div>
              {imagePreviewUrl && (
                <div className="image-preview max-w-[150px] w-full h-[200px]">
                  <img
                    className="max-w-[150px] w-full h-[180px] object-contain"
                    src={imagePreviewUrl}
                    alt="Image Preview"
                  />
                </div>
              )}

              {/* Direct upload on form submit; no external image host */}

            </div>
          </div>
          <div className='w-full my-6'>
            <input
              className='max-w-[560px] h-12 bg-gray-500 rounded-md outline-none px-3 text-white cursor-pointer w-full'
              type='submit'
              value='Submit'
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBrandName;
