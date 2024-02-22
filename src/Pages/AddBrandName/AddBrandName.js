import axios from 'axios';
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
  const [deleteButtonVisible, setDeleteButtonVisible] = useState(false);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [imageDeleteHash, setImageDeleteHash] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [isUploadSuccessful, setIsUploadSuccessful] = useState(false);
  const handleUploadButtonClick = async () => {
    try {
      // Check if an image is selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);

        const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          params: {
            key: '04ece4ca20ee040e0e21680d6591ddfe', // Replace with your actual API key
          },
        });

        if (response.data.status === 200) {
          // Image uploaded successfully, get the deletehash
          const deleteHash = response.data.data.delete_url;
          const bannerImageRes = response.data.data.display_url;

          // Now you can use this deletehash to delete the image later
          console.log('Image uploaded successfully. Deletehash:', response.data);

          // Show the delete button and store the deletehash in your component state
          setDeleteButtonVisible(true);
          setImageDeleteHash(deleteHash);
          setBannerImage(bannerImageRes)

          // Show success toast
          toast.success('Image uploaded successfully');

          // Set the upload status to true
          setIsUploadSuccessful(true);
        } else {
          toast.error('Failed to upload image');
        }
      } else {
        console.log('No image selected to upload.');
        // Show error toast if no image selected
        toast.error('Please select an image to upload.', { duration: 4000 });
      }
    } catch (error) {
      console.error('Error uploading image to ImgBB:', error);

      // Show error toast
      toast.error('Error uploading image. Please try again later.', { duration: 4000 });
      // Handle the error as needed
    }
  };
  const handleDeleteButtonClick = async (deleteUrl) => {
    console.log("deleteUrl-------------", deleteUrl);

    // try {
    //   // Extract delete hash from the delete URL
    //   const deleteHash = deleteUrl.split('/').pop();
    //   console.log("deleteHash-------------", deleteHash);

    //   const apiKey = '04ece4ca20ee040e0e21680d6591ddfe';

    //   // Send DELETE request to ImgBB API
    //   const response = await axios.delete(`https://api.imgbb.com/1/image/${deleteHash}?key=${apiKey}`);

    //   if (response.status === 200) {
    //     // Image deleted successfully, update your component state or take any necessary actions
    //     toast.success('Image deleted successfully');
    //     console.log("Image deleted successfully");
    //   } else {
    //     toast.error('Failed to delete image');
    //     console.error("Failed to delete image:", response.data);
    //   }
    // } catch (error) {
    //   // Log detailed information about the error
    //   console.error('Error deleting image:', error);

    //   // Check if the error response is available
    //   if (error.response) {
    //     console.error("Error response from ImgBB API:", error.response.data);
    //   } else if (error.request) {
    //     // The request was made but no response was received
    //     console.error("No response received from ImgBB API. Request details:", error.request);
    //   } else {
    //     // Something happened in setting up the request that triggered an Error
    //     console.error("Error setting up the request:", error.message);
    //   }

    //   toast.error('Error deleting image. Check console for details.');
    // }
  };

  const onSubmit = async (data) => {

    const brandData = {
      name: data.name.toLowerCase(),
      brandBannerImg: bannerImage,
    }
    console.log("brandData",brandData);
    try {

      const response = await axios.post('http://localhost:2000/api/brandName', brandData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Show success message using react-hot-toast
      toast.success('Brand name added successfully!', {
        duration: 3000, // Duration in milliseconds
      });

      console.log(response.data);
    } catch (error) {
      // Show error message using react-hot-toast
      toast.error(error?.response?.data.error ? error?.response?.data.error : 'Error adding brand name. Please try again.');

      console.error('Error submitting data:', error?.response?.data.error);
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

              {console.log("isImageSelected", isImageSelected)}
              {selectedImage && (
                <button
                  type="button"
                  onClick={handleUploadButtonClick}
                  disabled={isUploadSuccessful} // Disable the button if the upload is successful
                  className="max-w-[150px] w-full h-[40px] bg-blue-500 text-white rounded-md outline-none px-3 cursor-pointer disabled:bg-slate-200"
                >
                  Upload
                </button>
              )}
              {deleteButtonVisible && (
                <button
                  type="button"
                  className="max-w-[150px] w-full h-[40px] bg-red-500 text-white rounded-md outline-none px-3 cursor-pointer"
                  onClick={() => handleDeleteButtonClick(imageDeleteHash)}
                >
                  image Delete
                </button>
              )}

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
