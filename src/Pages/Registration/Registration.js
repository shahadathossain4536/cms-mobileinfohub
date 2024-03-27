import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { signup } from '../../redux/actions/user.actions';
import axios from 'axios';
import toast from 'react-hot-toast';
const Registration = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue, // Add this line to get the setValue function
  } = useForm();
  const [selectedOption, setSelectedOption] = useState(null);
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  // console.log("object", selectedOption);
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const user = useSelector((state) => state.user);
  const options = [
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'shopkeeper', label: 'Shopkeeper' },
  ];

  const [sliderPhotos, setSliderPhotos] = useState([null]);
  const [isPhotoUpdated, setIsPhotoUpdated] = useState(false);
  console.log("sliderPhotos", sliderPhotos);
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
  const removePhotoInput = (index) => {
    setSliderPhotos([null])// Update isPhotoUpdated status based on remaining photos
    setIsPhotoUpdated(false);
  };



  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    setIsPhotoUpdated(false);
  };

  // ... (Your existing functions)

  const [imageLinks, setImageLinks] = useState([]);

const uploadImageToImageBB = async () => {
  try {
    setIsLoading(true); // Set loading state while uploading
    const apiKey = '04ece4ca20ee040e0e21680d6591ddfe';
    const formData = new FormData();

    // Add each image from sliderPhotos to formData
    sliderPhotos.forEach((photo, index) => {
      if (photo) {
        const base64Image = photo.split(';base64,').pop();
        formData.append('image', base64Image);
      }
    });

    // Make POST request to ImageBB API
    const response = await axios.post('https://api.imgbb.com/1/upload?key=' + apiKey, formData);

    // Extract image URLs from the response
    // const imageLinks = response.data.data.image.map(image => image.url);
  console.log("imageLinks",response?.data?.url);

    // Update state with uploaded image links
    setImageLinks(imageLinks);

    // Reset sliderPhotos and isPhotoUpdated state
    setSliderPhotos([null]);
    setIsPhotoUpdated(false);

    // Notify user of successful upload
    toast.success('Images uploaded successfully');
  } catch (error) {
    // Handle errors
    console.error('Error uploading images:', error);
    // Notify user of error
    toast.error('Error uploading images. Please try again.');
  } finally {
    setIsLoading(false); // Reset loading state
  }
};




  const onSubmit = async (data) => {

    // reset();
    // dispatch(signup(user));

    // const user = {
    //   role : selectedOption?.value,
    //   ...data
    // }
    console.log(data);

    // dispatch(signup(data));
  };


  return (
    <div className='flex justify-center items-center  h-[600px]'>
      <div className='max-w-[650px] w-full mx-auto my-auto'>
        <h2 className='text-center text-2xl '>Registration</h2>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col justify-center items-center'>
          <Select
            className="basic-single max-w-[600px] w-full border-2 border-gray-500 rounded-lg block outline-none text-xl my-4"
            classNamePrefix="select"
            onChange={setSelectedOption}
            isDisabled={isDisabled}
            isLoading={isLoading}
            isClearable={isClearable}
            isRtl={isRtl}
            isSearchable={isSearchable}
            name="color"
            options={options}


          />
          {
            selectedOption?.value === 'shopkeeper' &&
            <div className='max-w-[600px] w-full'>
              {sliderPhotos.map((photo, index) => (
                <div key={index} className="max-w-[200px] w-full h-[300px]">
                  <div className="w-full flex items-center gap-5 justify-between">
                    {!photo && (
                      <div className=" w-full my-5">
                        <div className="flex relative max-w-[200px] w-full h-[300px] ">
                          <input
                            type="file"
                            accept="image/*"
                            {...register(`sliderImage${index}`, {
                              required: "Please select an image",
                            })}
                            id={`file-upload-${index}`}  // Add a unique ID for each file input
                            className="appearance-none max-w-[200px] w-full h-[300px] cursor-pointer relative after:absolute after:max-w-[200px] after:w-full after:h-[300px] after:bg-slate-200 after:top-0 after:left-0 after:right-0 after:bottom-0 after:border-dashed after:border-[2px] after:px-2 after:rounded-lg after:border-black "
                            onChange={(e) => {
                              previewSliderImage(e.target.files[0], index);
                            }}
                          />

                          <label
                            htmlFor={`file-upload-${index}`}
                            className="absolute w-full flex flex-col justify-center items-center gap-2 h-[300px] cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="32"
                              height="32"
                              fill="rgba(0,0,0,1)"
                            >
                              <path d="M21 15V18H24V20H21V23H19V20H16V18H19V15H21ZM21.0082 3C21.556 3 22 3.44495 22 3.9934V13H20V5H4V18.999L14 9L17 12V14.829L14 11.8284L6.827 19H14V21H2.9918C2.44405 21 2 20.5551 2 20.0066V3.9934C2 3.44476 2.45531 3 2.9918 3H21.0082ZM8 7C9.10457 7 10 7.89543 10 9C10 10.1046 9.10457 11 8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7Z"></path>
                            </svg>

                            <p className="text-center text-xs px-2 ">
                              Drag and drop{" "}
                              <span className="text-indigo-700 ">
                                or browse to
                              </span>{" "}
                              upload PNG, JPG, GIF
                            </p>
                          </label>

                          <button
                            type="button"
                            onClick={() => removePhotoInput(index)}
                            className="absolute top-[-12px] right-[-8px] cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              fill="rgba(0,0,0,1)"
                            >
                              <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path>
                            </svg>
                          </button>
                        </div>

                        {errors[`sliderImage${index}`] && (
                          <p className="error-message">
                            {errors[`sliderImage${index}`].message}
                          </p>
                        )}
                      </div>
                    )}

                    {photo && (
                      <div className="w-full my-5">
                        <div className="image-preview relative max-w-[200px] w-full h-[300px] bg-slate-100 border-dashed border-[2px] border-black p-2 rounded-lg flex justify-center items-center">
                          <img
                            className="w-full   object-contain"
                            src={photo}
                            alt={`Image Preview ${index}`}
                          />
                          {
                            isPhotoUpdated && <button
                              type="button"
                              onClick={() => removePhotoInput(index)}
                              className="absolute top-[-12px] right-[-8px] cursor-pointer"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                fill="rgba(0,0,0,1)"
                              >
                                <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path>
                              </svg>
                            </button>
                          }

                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ))}

            </div>
          }
          <div className='max-w-[600px] w-full'>
            {isPhotoUpdated && (
              <div className="w-full my-6">
                <button
                  type="button"
                  className="w-full h-[40px] bg-green-500 text-white rounded-md outline-none px-3 cursor-pointer"
                  onClick={() => uploadImageToImageBB()} // Pass the file from sliderPhotos
                >
                  Upload
                </button>
              </div>
            )}
          </div>


          <div className=' flex justify-center items-center gap-[20px]'>
            {
              selectedOption?.value === 'shopkeeper' && <div className='max-w-[600px] w-full'>
                <input className='max-w-[290px] w-full h-14 border-2 border-gray-500 rounded-lg block outline-none px-4 text-xl my-4' type="text" placeholder='Shop Name'
                  {...register("shopName", {
                    required: {
                      value: true,
                      message: "Enter Your Shop Name",
                    },

                  })}
                />

              </div>
            }

            {/* shopEmail */}
            {
              selectedOption?.value === 'shopkeeper' && <div className='max-w-[600px] w-full'>
                <input className='max-w-[290px] w-full h-14 border-2 border-gray-500 rounded-lg block outline-none px-4 text-xl my-4' type="text" placeholder='Shop email'
                  {...register("shopEmail", {
                    required: {
                      value: true,
                      message: "Enter Your Shop Email",
                    },

                  })}
                />

              </div>
            }
          </div>
          <div className=' flex justify-center items-center gap-[20px]'>

            {/* shopPhoneNumber */}
            {
              selectedOption?.value === 'shopkeeper' && <div className='max-w-[600px] w-full'>
                <input className='max-w-[600px] w-full h-14 border-2 border-gray-500 rounded-lg block outline-none px-4 text-xl my-4' type="text" placeholder='shopPhoneNumber'
                  {...register("shopPhoneNumber", {
                    required: {
                      value: true,
                      message: "Enter Your Shop shopPhoneNumber",
                    },

                  })}
                />

              </div>
            }
            {/* shopFbLink */}
            {
              selectedOption?.value === 'shopkeeper' && <div className='max-w-[600px] w-full'>
                <input className='max-w-[600px] w-full h-14 border-2 border-gray-500 rounded-lg block outline-none px-4 text-xl my-4' type="text" placeholder='shopFbLink'
                  {...register("shopFbLink", {
                    required: {
                      value: true,
                      message: "Enter Your shopFbLink",
                    },

                  })}
                />

              </div>
            }
          </div>
          <div className=' flex justify-center items-center gap-[20px]'>
            {
              selectedOption?.value === 'shopkeeper' && <div className='max-w-[600px] w-full'>
                <input className='max-w-[600px] w-full h-14 border-2 border-gray-500 rounded-lg block outline-none px-4 text-xl my-4' type="text" placeholder='shopYtLink'
                  {...register("shopYtLink", {
                    required: {
                      value: true,
                      message: "Enter Your shopYtLink",
                    },

                  })}
                />

              </div>
            }
            {
              selectedOption?.value === 'shopkeeper' && <div className='max-w-[600px] w-full'>
                <input className='max-w-[600px] w-full h-14 border-2 border-gray-500 rounded-lg block outline-none px-4 text-xl my-4' type="text" placeholder='contactNumber'
                  {...register("contactNumber", {
                    required: {
                      value: true,
                      message: "Enter Your contactNumber",
                    },

                  })}
                />

              </div>
            }
          </div>

          <div className=' flex justify-center items-center gap-[20px]'>
            <div className='max-w-[600px] w-full'>
              <input className='max-w-[600px] w-full h-14 border-2 border-gray-500 rounded-lg block outline-none px-4 text-xl my-4' type="text" placeholder='FirstName'
                {...register("firstName", {
                  required: {
                    value: true,
                    message: "Enter Your firstName",
                  },

                })}
              />
              <label class="label">
                {errors.firstName?.type === "required" && (
                  <span class="label-text-alt text-red-600">
                    {errors?.firstName?.message}
                  </span>
                )}

              </label>
            </div>
            <div className='max-w-[600px] w-full'>
              <input className='max-w-[600px] w-full h-14 border-2 border-gray-500 rounded-lg block outline-none px-4 text-xl my-4' type="text" placeholder='LastName'
                {...register("lastName", {
                  required: {
                    value: true,
                    message: "Enter Your lastName",
                  },

                })}
              />
              <label class="label">
                {errors.lastName?.type === "required" && (
                  <span class="label-text-alt text-red-600">
                    {errors?.lastName?.message}
                  </span>
                )}

              </label>
            </div>
          </div>

          <div className='max-w-[600px] w-full'>
            <input className='max-w-[600px] w-full h-14 border-2 border-gray-500 rounded-lg block outline-none px-4 text-xl my-4' type="text" placeholder='Email'
              {...register("email", {
                required: {
                  value: true,
                  message: "Enter Your Email",
                },
                pattern: {
                  value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                  message: "Enter a valid email",
                },
              })}
            />
            <label class="label">
              {errors.email?.type === "required" && (
                <span class="label-text-alt text-red-600">
                  {errors?.email?.message}
                </span>
              )}
              {errors.email?.type === "pattern" && (
                <span class="label-text-alt text-red-600">
                  {errors?.email?.message}
                </span>
              )}
            </label>
          </div>
          <div className='max-w-[600px] w-full'>
            <input className='max-w-[600px] w-full h-14 border-2 border-gray-500 rounded-lg block outline-none px-4 text-xl my-4' type="password" placeholder='Password'
              {...register("password", {
                required: {
                  value: true,
                  message: "Enter Your Password",
                },
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    "Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character",
                },
              })} />
            <label class="label">
              {errors.password?.type === "required" && (
                <span class="label-text-alt text-red-600">
                  {errors?.password?.message}
                </span>
              )}
              {errors.password?.type === "pattern" && (
                <span class="label-text-alt text-red-600">
                  {errors?.password?.message}
                </span>
              )}
            </label>
          </div>

          <input className='max-w-[600px] w-full h-14 bg-slate-500 rounded-lg block outline-none text-white px-4 text-xl my-4 cursor-pointer' type="submit" value="Registration" />
        </form>
      </div>
    </div>
  );
};

export default Registration;