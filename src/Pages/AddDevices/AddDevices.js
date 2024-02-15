import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import Select from 'react-select';
const AddDevices = () => {
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  const [showDataAddModal, setShowDataAddModal] = useState(false)
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
  } = useForm();
  // const { fields, append, remove } = useFieldArray({
  //   control,
  //   name: 'data', // name of the field array
  // });
  const [mobileBrand, setMobileBrand] = useState([]); // State to store the fetched data
  const [brandOption, setBrandOption] = useState([]); // State to store the fetched data
  const [selectedImage, setSelectedImage] = useState(null);
  const [step, setStep] = useState(1);
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

  // console.log("mobileBrand",mobileBrand);
  useEffect(() => {
    // Fetch data using Axios when the component mounts
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:2000/api/brandName');
        // console.log("response", response.data.brandNames);
        const formattedData = response.data.brandNames.map((brand) => ({
          // value: brand.name,
          label: brand.name,
        }));
        setBrandOption(formattedData);

        // console.log("formattedData", formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once when the component mounts
  const handleShowModal = () => {
    setShowDataAddModal(true);
  };

  const handleCloseModal = () => {
    setShowDataAddModal(false);
  };
  const mobileBrand2 = [
    {

      label: 'SAMSUNG',

    },
    {

      label: 'APPLE',

    },
    {

      label: 'HUAWEI',

    },
    {

      label: 'NOKIA',

    },
    {

      label: 'SONY',

    },
  ]
  const onSubmit = async (data) => {

    console.log("deviceData", data);
  }

  // const handleAddInput = () => {
  //   append([{ name: '', value: '' }, { name: '', value: '' }]);
  // };

  return (
    <div className='max-w-[1000px] w-full border-[2px] rounded-md'>




      <h2 className='py-3 text-center text-xl'>Add Device</h2>

      <div className='w-full flex justify-center items-center'>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='w-full max-w-[560px]  flex flex-col justify-center items-center'
        >


          {/* Modal */}

          {/* banner data */}
          {
            step === 1 && <div className='w-full'>
            <div className='w-full my-4'>
              <p className='py-2 font-raleway font-medium text-lg sm:px-0 px-5'>Brand Name</p>
              <Select
                className="basic-single sm:px-0 px-5"
                classNamePrefix="select"

                isDisabled={isDisabled}
                isLoading={isLoading}
                isClearable={isClearable}
                isRtl={isRtl}
                isSearchable={isSearchable}
                name="color"
                options={brandOption}
              />
            </div>
            <div className='w-full flex items-center gap-5'>

              <div>
                <label htmlFor="image">Image</label>
                <input
                  type="file"
                  {...register('image', {
                    required: 'Please select an image',
                  })}
                  onChange={(e) => {
                    setSelectedImage(e.target.files[0]);
                    previewImage(e.target.files[0]);
                  }}
                />
                {errors.image && <p className="error-message">{errors.image.message}</p>}</div>

              <div>
                {imagePreviewUrl && (
                  <div className="image-preview w-28 ">
                    <img src={imagePreviewUrl} alt="Image Preview" />
                  </div>
                )}
              </div>
            </div>

            <div className='w-full'>
              <label htmlFor="">Model Name</label>
              <input
                className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full'
                type='text'
                {...register('modelName', {
                  required: {
                    value: true,
                    message: 'Enter Your Model Name',
                  },
                })}
              />
              <label className='label'>
                {errors.modelName?.type === 'required' && (
                  <span className='label-text-alt text-red-600'>
                    {errors?.modelName?.message}
                  </span>
                )}
              </label>
            </div>
            <div className='w-full'>
              <label htmlFor="">Release Date</label>
              <input
                className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full'
                type='text'
                {...register('release_date', {

                })}
              />

            </div>
            <div className='w-full'>
              <label htmlFor="">Weight</label>
              <input
                className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full'
                type='text'
                {...register('weight', {

                })}
              />

            </div>
            <div className='w-full'>
              <label htmlFor="">os_android</label>
              <input
                className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full'
                type='text'
                {...register('os_android', {

                })}
              />

            </div>
            <div className='w-full'>
              <label htmlFor="">os_brand</label>
              <input
                className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full'
                type='text'
                {...register('os_brand', {

                })}
              />

            </div>
            <div className='w-full'>
              <label htmlFor="">displaySize</label>
              <input
                className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full'
                type='text'
                {...register('displaySize', {

                })}
              />

            </div>
            <div className='w-full'>
              <label htmlFor="">displayResolution</label>
              <input
                className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full'
                type='text'
                {...register('displayResolution', {

                })}
              />

            </div>
            <div className='w-full'>
              <label htmlFor="">expandable_storage</label>
              <input
                className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full'
                type='text'
                {...register('expandable_storage', {
                  required: {
                    value: true,
                    message: 'Enter Your Brand Name',
                  },
                })}
              />

            </div>
            <div className='w-full'>
              <label htmlFor="">expandable_storage_type</label>
              <input
                className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full'
                type='text'
                {...register('expandable_storage_type', {
                  required: {
                    value: true,
                    message: 'Enter Your Brand Name',
                  },
                })}
              />

            </div>
            <div className='w-full'>
              <label htmlFor="">ram</label>
              <input
                className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full'
                type='text'
                {...register('ram', {
                  required: {
                    value: true,
                    message: 'Enter Your Brand Name',
                  },
                })}
              />

            </div>
            <div className='w-full'>
              <label htmlFor="">storage</label>
              <input
                className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full'
                type='text'
                {...register('storage', {
                  required: {
                    value: true,
                    message: 'Enter Your Brand Name',
                  },
                })}
              />

            </div>
          </div>
          }

          {/* step-2 */}
          {
            step === 2 && <div className='w-full'>
            <p>NETWORK</p>
            <div className='flex justify-center items-center gap-2'>
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[30%]' type="text" value="Technology" />
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[70%]' type="text" />

            </div>
            <button className='bg-gray-500 text-white h-12 rounded-md px w-full mt-3'>Add Input</button>
          </div>
          }
          {/* step-2 */}
          {/* step-3 */}
          {
            step === 3 && <div className='w-full'>
            <p>LAUNCH</p>
            <div className='flex justify-center items-center gap-2'>
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[30%]' type="text" value="Announced" />
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[70%]' type="text" />

            </div>
            <div className='flex justify-center items-center gap-2'>
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[30%]' type="text" value="Status" />
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[70%]' type="text" />

            </div>
            <button className='bg-gray-500 text-white h-12 rounded-md px w-full mt-3'>Add Input</button>
          </div>
          }
          {/* step-3 */}
          {/* step-4 */}
          {
            step === 4 &&  <div className='w-full'>
            <p>BODY</p>
            <div className='flex justify-center items-center gap-2'>
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[30%]' type="text" value="Dimensions" />
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[70%]' type="text" />

            </div>
            <div className='flex justify-center items-center gap-2'>
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[30%]' type="text" value="Weight" />
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[70%]' type="text" />

            </div>
            <div className='flex justify-center items-center gap-2'>
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[30%]' type="text" value="Build" />
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[70%]' type="text" />

            </div>
            <div className='flex justify-center items-center gap-2'>
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[30%]' type="text" value="SIM" />
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[70%]' type="text" />

            </div>
            <div className='flex justify-center items-center gap-2'>
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[30%]' type="text" value="IP Status" />
              <input className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[70%]' type="text" />

            </div>
            <button className='bg-gray-500 text-white h-12 rounded-md px w-full mt-3'>Add Input</button>
          </div>
         }
          {/* step-4 */}


          {/* banner data */}

          {/* main data */}



          {/* main data */}
          {/* submit btn */}
          <div className='w-full flex justify-center items-center gap-5 my-6'>
            { step > 1 && <button
              onClick={()=>setStep(step - 1)}
              className=' h-12 bg-gray-500 rounded-md outline-none px-3 text-white cursor-pointer w-full'

            >Previous</button>}
            <button
              onClick={()=>setStep(step + 1)}
              className=' h-12 bg-gray-500 rounded-md outline-none px-3 text-white cursor-pointer w-full'

            >Next</button>
          </div>

          <div className='w-full my-6'>
            <input
              className='max-w-[560px] h-12 bg-gray-500 rounded-md outline-none px-3 text-white cursor-pointer w-full'
              type='submit'
              value='Submit'
            />
          </div>
          {/* submit btn */}
        </form>

      </div>
    </div>
  );
};

export default AddDevices;