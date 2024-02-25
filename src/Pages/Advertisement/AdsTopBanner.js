import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdsTopBanner = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const [selectedOption, setSelectedOption] = useState('photo');
  const [sliderPhotos, setSliderPhotos] = useState([null]);
  const [isPhotoUpdated, setIsPhotoUpdated] = useState(false);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    // Reset photo update status when changing the option
    setIsPhotoUpdated(false);
  };

  const addPhotoInput = () => {
    if (sliderPhotos.length < 4) {
      setSliderPhotos([...sliderPhotos, null]);
      // Reset photo update status when adding a new photo input
      setIsPhotoUpdated(false);
    } else {
      // Display a message or toast indicating that the maximum number of photos is reached
      toast.error('Maximum number of photos reached (4)');
    }
  };

  const previewSliderImage = (file, index) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedPhotos = [...sliderPhotos];
        updatedPhotos[index] = reader.result;
        setSliderPhotos(updatedPhotos);
        // Set photo update status to true when a new photo is added or updated
        setIsPhotoUpdated(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    // Handle form submission based on selected option
    switch (selectedOption) {
      case 'photo':
        // Handle photo submission
        break;
      case 'video':
        // Handle video submission
        break;
      case 'slider':
        // Handle slider submission
        break;
      default:
        break;
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
            <select
              name='options'
              id='options'
              className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full'
              value={selectedOption}
              onChange={handleOptionChange}
            >
              <option value='photo'>Photo</option>
              <option value='video'>Video</option>
              <option value='slider'>Slider</option>
            </select>
          </div>
          {
            selectedOption == 'photo' && <div>
              <input
                type="file"
                accept="image/*"
                {...register("bannerImage", {
                  required: "Please select an image",
                })}
                className="max-w-[150px] w-full h-[200px] relative "
              // onChange={(e) => {
              //   setSelectedImage(e.target.files[0]);
              //   previewImage(e.target.files[0]);
              // }}
              />

            </div>
          }
          {selectedOption === 'slider' && (
            <div className='w-full'>
              {sliderPhotos.map((photo, index) => (
                <div key={index} className='w-full'>
                  <div className='w-full flex items-center gap-5 justify-between'>
                    <div className='max-w-[150px] w-full h-[200px]'>
                      <input
                        type='file'
                        accept='image/*'
                        {...register(`sliderImage${index}`, {
                          required: 'Please select an image',
                        })}
                        className='max-w-[150px] w-full h-[200px] relative '
                        onChange={(e) => {
                          previewSliderImage(e.target.files[0], index);
                        }}
                      />
                      {errors[`sliderImage${index}`] && (
                        <p className='error-message'>{errors[`sliderImage${index}`].message}</p>
                      )}
                    </div>

                    <div>
                      {photo && (
                        <div className='image-preview max-w-[150px] w-full h-[200px]'>
                          <img
                            className='max-w-[150px] w-full h-[180px] object-contain'
                            src={photo}
                            alt={`Image Preview ${index}`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isPhotoUpdated && (
                <button
                  type='button'
                  className='max-w-[150px] w-full h-[40px] bg-green-500 text-white rounded-md outline-none px-3 cursor-pointer'
                  onClick={() => {
                    // Handle update photo logic for all photos
                    console.log('Update Photo clicked for all photos');
                  }}
                >
                  Update All Photos
                </button>
              )}
              <button
                type='button'
                onClick={addPhotoInput}
                className='max-w-[150px] w-full h-[40px] bg-blue-500 text-white rounded-md outline-none px-3 cursor-pointer'
              >
                Add Photo
              </button>
            </div>
          )}

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

export default AdsTopBanner;
