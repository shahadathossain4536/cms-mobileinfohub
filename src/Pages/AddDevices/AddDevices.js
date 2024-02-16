import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import Select from 'react-select';
import StepFormSection from '../../component/StepFormSection/StepFormSection';
const AddDevices = () => {
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  console.log("selectedOption", selectedOption?.label);
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const [brandOption, setBrandOption] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [step, setStep] = useState(1);
  const [photoGallery, setPhotoGallery] = useState([]);

  const handlePhotoChange = (e, index) => {
    const files = e.target.files;
    const filesArray = Array.from(files);

    // Update the corresponding element in photoGallery state
    setPhotoGallery((prevGallery) => {
      const updatedGallery = [...prevGallery];
      updatedGallery[index] = filesArray[0];
      return updatedGallery;
    });
  };

  const handleAddPhotoInput = () => {
    // Add a new element to photoGallery state
    setPhotoGallery((prevGallery) => [...prevGallery, null]);
  };
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [inputData, setInputData] = useState({
    network: [{ name: 'Technology', subData: '' }],
    launch: [{ name: 'Announced', subData: '' }, { name: 'Status', subData: '' }],
    body: [{ name: 'Dimensions', subData: '' },
    { name: 'Weight', subData: '' },
    { name: 'Build', subData: '' },
    { name: 'SIM', subData: '' },
    { name: 'IP Status', subData: '' },

    ],
    display: [{ name: 'Type', subData: '' },
    { name: 'Size', subData: '' },
    { name: 'Resolution', subData: '' },
    { name: 'Protection', subData: '' },


    ],
    platform: [
      { name: 'OS', subData: '' },
      { name: 'Chipset', subData: '' },
      { name: 'CPU', subData: '' },
      { name: 'GPU', subData: '' },
    ],
    memory: [
      { name: 'Card Slot', subData: '' },
      { name: 'Internal', subData: '' },

    ],
    mainCamera: [
      { name: '', subData: '' },
      { name: 'Features', subData: '' },
      { name: 'Video', subData: '' },

    ],
    selfieCamera: [
      { name: '', subData: '' },
      { name: 'Features', subData: '' },
      { name: 'Video', subData: '' },

    ],
    sound: [
      { name: 'Loudspeaker', subData: '' },
      { name: '3.5mm jack', subData: '' },

    ],
    commination: [
      { name: 'WLAN', subData: '' },
      { name: 'Bluetooth', subData: '' },
      { name: 'Positioning', subData: '' },
      { name: 'NFC', subData: '' },
      { name: 'Radio', subData: '' },
      { name: 'USB', subData: '' },
    ],
    features: [
      { name: 'Sensors', subData: '' },

    ],
    battery: [
      { name: 'Type', subData: '' },
      { name: 'Wired Charging', subData: '' },
      { name: 'Wire Less Charging', subData: '' },
      { name: 'Reverse Charging', subData: '' },
    ], color: [
      { name: 'Color', subData: '' },

    ], price: [
      { name: 'Price', subData: '' },

    ],
  });






  const numberOfArrays = Object.keys(inputData).length;

  const handleAddInput = (section) => {

    const updatedData = { ...inputData };

    if (!Array.isArray(updatedData[section])) {
      updatedData[section] = [];
    }

    updatedData[section] = [...updatedData[section], { name: '', subData: '' }];
    setInputData(updatedData);
  };

  const handleInputChange = (section, index, key, value) => {
    const updatedData = { ...inputData };
    updatedData[section][index][key] = value;
    setInputData(updatedData);
  };

  const handleDeleteInput = (section, index) => {
    const updatedData = { ...inputData };
    updatedData[section].splice(index, 1);
    setInputData(updatedData);
  };
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:2000/api/brandName');

        const formattedData = response.data.brandNames.map((brand) => ({

          label: brand.name,
        }));
        setBrandOption(formattedData);


      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  const onSubmit = async (data) => {

    console.log("data", data);
    const bannerImages = Array.from(data.image).map(file => file);
    const devicesData =
    {
      "brand": `${selectedOption?.label}`,
      "model": `${data.modelName}`,
      "release_date": `${data.release_date}`,
      "banner_img": bannerImages,
      "weight": `${data.weight}`,
      "thickness": `${data.weight}`,
      "os_android": `${data.os_android}`,
      "os_brand": `${data.os_brand}`,
      "displaySize": `${data.displaySize}`,
      "displayResolution": `${data.displayResolution}`,
      "expandable_storage": `${data.expandable_storage}`,
      "expandable_storage_type": `${data.expandable_storage_type}`,
      "ram": `${data.ram}`,
      "storage": `${data.storage}`,
      "data": Object.entries(inputData).map(([type, subType]) => ({ type, subType })),
    }

    console.log("devicesData", devicesData);
  }

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
                  onChange={setSelectedOption}
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

          {step === 2 && <StepFormSection
            sectionName='network'
            sectionData={inputData.network}
            handleInputChange={handleInputChange}
            handleDeleteInput={handleDeleteInput}
            handleAddInput={handleAddInput}
          />}
          {step === 3 && <StepFormSection
            sectionName='launch'
            sectionData={inputData.launch}
            handleInputChange={handleInputChange}
            handleDeleteInput={handleDeleteInput}
            handleAddInput={handleAddInput}
          />}
          {step === 4 && <StepFormSection
            sectionName='body'
            sectionData={inputData.body}
            handleInputChange={handleInputChange}
            handleDeleteInput={handleDeleteInput}
            handleAddInput={handleAddInput}
          />}
          {step === 5 && <StepFormSection
            sectionName='display'
            sectionData={inputData.display}
            handleInputChange={handleInputChange}
            handleDeleteInput={handleDeleteInput}
            handleAddInput={handleAddInput}
          />}
          {step === 6 && <StepFormSection
            sectionName='platform'
            sectionData={inputData.platform}
            handleInputChange={handleInputChange}
            handleDeleteInput={handleDeleteInput}
            handleAddInput={handleAddInput}
          />}
          {step === 7 && <StepFormSection
            sectionName='memory'
            sectionData={inputData.memory}
            handleInputChange={handleInputChange}
            handleDeleteInput={handleDeleteInput}
            handleAddInput={handleAddInput}
          />}
          {step === 8 && <StepFormSection
            sectionName='mainCamera'
            sectionData={inputData.mainCamera}
            handleInputChange={handleInputChange}
            handleDeleteInput={handleDeleteInput}
            handleAddInput={handleAddInput}
          />}
          {step === 9 && <StepFormSection
            sectionName='selfieCamera'
            sectionData={inputData.selfieCamera}
            handleInputChange={handleInputChange}
            handleDeleteInput={handleDeleteInput}
            handleAddInput={handleAddInput}
          />}
          {step === 10 && <StepFormSection
            sectionName='sound'
            sectionData={inputData.sound}
            handleInputChange={handleInputChange}
            handleDeleteInput={handleDeleteInput}
            handleAddInput={handleAddInput}
          />}
          {step === 11 && <StepFormSection
            sectionName='commination'
            sectionData={inputData.commination}
            handleInputChange={handleInputChange}
            handleDeleteInput={handleDeleteInput}
            handleAddInput={handleAddInput}
          />}
          {step === 12 && <StepFormSection
            sectionName='features'
            sectionData={inputData.features}
            handleInputChange={handleInputChange}
            handleDeleteInput={handleDeleteInput}
            handleAddInput={handleAddInput}
          />}
          {step === 13 && <StepFormSection
            sectionName='battery'
            sectionData={inputData.battery}
            handleInputChange={handleInputChange}
            handleDeleteInput={handleDeleteInput}
            handleAddInput={handleAddInput}
          />}
          {step === 14 && <StepFormSection
            sectionName='color'
            sectionData={inputData.color}
            handleInputChange={handleInputChange}
            handleDeleteInput={handleDeleteInput}
            handleAddInput={handleAddInput}
          />}
          {step === 15 && <StepFormSection
            sectionName='price'
            sectionData={inputData.price}
            handleInputChange={handleInputChange}
            handleDeleteInput={handleDeleteInput}
            handleAddInput={handleAddInput}
          />}
          {step === 16 &&
            <div className='w-full'>
              <p className='text-center'>Set Photo Gallery</p>
            {photoGallery.map((photo, index) => (
        <div key={index}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoChange(e, index)}
          />
          {photo && (
            <img
              src={URL.createObjectURL(photo)}
              alt={`Preview ${index + 1}`}
              style={{ maxWidth: '100px', maxHeight: '100px', margin: '5px' }}
            />
          )}
        </div>
      ))}

      <button onClick={handleAddPhotoInput}>Add Photo</button>
            </div>
          }









          {/* main data */}
          {/* submit btn */}
          <div className='w-full flex justify-center items-center gap-5 my-6'>
            {step > 1 && <button
              onClick={() => setStep(step - 1)}
              className=' h-12 bg-gray-500 rounded-md outline-none px-3 text-white cursor-pointer w-full'

            >Previous</button>}
            {
              step < 16 && <button
                onClick={() => setStep(step + 1)}
                className=' h-12 bg-gray-500 rounded-md outline-none px-3 text-white cursor-pointer w-full' >Next</button>
            }
          </div>
          {
            step === 16 && <div className='w-full my-6'>
              <input
                className='max-w-[560px] h-12 bg-gray-500 rounded-md outline-none px-3 text-white cursor-pointer w-full'
                type='submit'
                value='Submit'
              />
            </div>
          }

          {/* submit btn */}
        </form>

      </div>
    </div>
  );
};

export default AddDevices;