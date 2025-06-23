import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import StepFormSection from "../../component/StepFormSection/StepFormSection";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const UpdateDevice = () => {
  const { id } = useParams();
  const token = window.localStorage.getItem("token");
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://deviceinfohub-server.vercel.app/api/brandName");

        const formattedData = response.data.brandNames.map((brand) => ({
          label: brand.name,
        }));
        setBrandOption(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {


    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://deviceinfohub-server.vercel.app/api/devicesData/${id}`
        );
        const data = response.data;


        setDeviceDataOnly(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);
  const [deviceDataOnly, setDeviceDataOnly] = useState(null);
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [brandOption, setBrandOption] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [step, setStep] = useState(1);
  const [imagePreviewUrl, setImagePreviewUrl] = useState();

  const [photoGallery, setPhotoGallery] = useState([null]);

  const [startDate, setStartDate] = useState(null);
  const [expandableStorageOption, setExpandableStorageOption] = useState("no");
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [deleteButtonVisible, setDeleteButtonVisible] = useState(false);
  const [imageDeleteHash, setImageDeleteHash] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState([]);
  const [expandableStorageType, setExpandableStorageType] = useState("");
  const [backCameraNumber, setBackCameraNumber] = useState();
  const [frontCameraNumber, setFrontCameraNumber] = useState();
  const [showFormSection, setShowFormSection] = useState(false);
  const [isUploadSuccessful, setIsUploadSuccessful] = useState(false);

  useEffect(() => {
    const matchedOption = brandOption.find(
      (option) => option.label === deviceDataOnly?.brand
    );

    if (matchedOption) {
      setSelectedOption(matchedOption);

    }
    // Set the banner_img for image preview
    if (deviceDataOnly && deviceDataOnly.banner_img) {
      setImagePreviewUrl(deviceDataOnly.banner_img);
    }
    if (deviceDataOnly && deviceDataOnly.expandable_storage) {
      setExpandableStorageOption(deviceDataOnly.expandable_storage);
    }
    if (deviceDataOnly && deviceDataOnly.expandable_storage_type) {
      setExpandableStorageType(deviceDataOnly.expandable_storage_type);
    }
    if (deviceDataOnly && deviceDataOnly?.galleryPhoto) {
      setPhotoGallery(deviceDataOnly?.galleryPhoto);
    }
  }, [deviceDataOnly, brandOption]);

  const { data } = deviceDataOnly || {};

  const getDataByType = (data, targetType) => data && data.find(entry => entry.type === targetType);
  const networkData = getDataByType(data, 'network');
  const launchData = getDataByType(data, 'launch');
  const bodyData = getDataByType(data, 'body');
  const displayData = getDataByType(data, 'display');
  const platformData = getDataByType(data, 'platform');
  const memoryData = getDataByType(data, 'memory');
  const main_cameraData = getDataByType(data, 'main_camera');
  const selfie_cameraData = getDataByType(data, 'selfie_camera');
  const soundData = getDataByType(data, 'sound');
  const commsData = getDataByType(data, 'comms');
  const featuresData = getDataByType(data, 'features');
  const batteryData = getDataByType(data, 'battery');
  const colorData = getDataByType(data, 'color');
  const priceData = getDataByType(data, 'price');
  // Define the function to handle the Create button click
  const handleCreateButtonClick = (cameraName) => {

    // Ensure backCameraNumber is a positive integer
    const numberOfInputs = parseInt(backCameraNumber, 10);

    if (isNaN(numberOfInputs) || numberOfInputs <= 0) {
      // Handle invalid input (e.g., show an error message)
      return;
    }

    // Call handleAddInput to update the state with the specified number of inputs
    handleCameraInput(cameraName, numberOfInputs);

    // Show the form section
    setShowFormSection(true);
  };
  const handleSelfieCameraInput = (cameraName) => {

    // Ensure backCameraNumber is a positive integer
    const numberOfInputs = parseInt(frontCameraNumber, 10);

    if (isNaN(numberOfInputs) || numberOfInputs <= 0) {
      // Handle invalid input (e.g., show an error message)
      return;
    }

    // Call handleAddInput to update the state with the specified number of inputs
    handleCameraInput(cameraName, numberOfInputs);

    // Show the form section
    setShowFormSection(true);
  };

  const handleExpandableStorageChange = (e) => {
    setExpandableStorageOption(e.target.value);
  };

  // const handlePhotoChange = (e, index) => {
  //   const files = e.target.files;
  //   const filesArray = Array.from(files);

  //   setPhotoGallery((prevGallery) => {
  //     const updatedGallery = [...prevGallery];
  //     updatedGallery[index] = filesArray[0];

  //     // Check if an image is selected
  //     const hasImageSelected = updatedGallery.some((photo) => photo !== null);
  //     setIsImageSelected(hasImageSelected);

  //     return updatedGallery;
  //   });
  // };
  // const handleDeletePhoto = (index) => {
  //   setPhotoGallery((prevGallery) => {
  //     const updatedGallery = [...prevGallery];
  //     updatedGallery.splice(index, 1);
  //     return updatedGallery;
  //   });
  // };

  const handlePhotoChange = (e, index) => {
    const newGallery = [...photoGallery];
    newGallery[index] = URL.createObjectURL(e.target.files[0]);
    setPhotoGallery(newGallery);
  };

  const handleDeletePhoto = (index) => {
    const newGallery = [...photoGallery];
    newGallery.splice(index, 1); // Remove the photo at the specified index
    setPhotoGallery(newGallery);
  };
  const handleUploadButtonClick = async () => {
    try {
      // Check if an image is selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);

        const response = await axios.post(
          "https://api.imgbb.com/1/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              key: "04ece4ca20ee040e0e21680d6591ddfe", // Replace with your actual API key
            },
          }
        );

        if (response.data.status === 200) {
          // Image uploaded successfully, get the deletehash
          const deleteHash = response.data.data.delete_url;
          const bannerImageRes = response.data.data.display_url;



          // Show the delete button and store the deletehash in your component state
          setDeleteButtonVisible(true);
          setImageDeleteHash(deleteHash);
          setBannerImage(bannerImageRes);

          // Show success toast
          toast.success("Image uploaded successfully");

          // Set the upload status to true
          setIsUploadSuccessful(true);
        } else {
          toast.error("Failed to upload image");
        }
      } else {

        // Show error toast if no image selected
        toast.error("Please select an image to upload.", { duration: 4000 });
      }
    } catch (error) {
      console.error("Error uploading image to ImgBB:", error);

      // Show error toast
      toast.error("Error uploading image. Please try again later.", {
        duration: 4000,
      });
      // Handle the error as needed
    }
  };

  const handleDeleteButtonClick = async (deleteUrl) => {


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


  const handleAddPhotoInput = () => {
    setPhotoGallery((prevGallery) => [...prevGallery, null]);
  };
  const galleryPhotoUpload = async () => {
    const apiKey = "04ece4ca20ee040e0e21680d6591ddfe";
    try {
      const uploadPromises = photoGallery.map(async (photo, index) => {
        if (photo) {
          const formData = new FormData();
          formData.append("image", photo);

          const response = await fetch(
            "https://api.imgbb.com/1/upload?key=" + apiKey,
            {
              method: "POST",
              body: formData,
            }
          );

          const result = await response.json();

          if (result.success) {
            // Photo uploaded successfully, save the URL
            setUploadedPhotoUrls((prevUrls) => [...prevUrls, result.data.url]);
          } else {
            // Photo upload failed, show an error toast
            toast.error("Failed to upload photo");
          }
        }
      });

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // Show success toast after all uploads are complete
      toast.success("All photos uploaded successfully");
    } catch (error) {
      // Handle any errors during the upload process
      console.error("Error uploading photos:", error);
      toast.error("Error uploading photos");
    }
  };
  const [inputData, setInputData] = useState({
    network: [{ name: "Technology", subData: "" }],
    launch: [
      { name: "Announced", subData: "" },
      { name: "Status", subData: "" },
    ],
    body: [
      { name: "Dimensions", subData: "" },
      { name: "Weight", subData: "" },
      { name: "Build", subData: "" },
      { name: "SIM", subData: "" },
      { name: "IP Status", subData: "" },
    ],
    display: [
      { name: "Type", subData: "" },
      { name: "Size", subData: "" },
      { name: "Resolution", subData: "" },
      { name: "Protection", subData: "" },
    ],
    platform: [
      { name: "OS", subData: "" },
      { name: "Chipset", subData: "" },
      { name: "CPU", subData: "" },
      { name: "GPU", subData: "" },
    ],
    memory: [
      { name: "Card Slot", subData: "" },
      { name: "Internal", subData: "" },
    ],
    main_camera: [
      // { name: "", subData: "" },
      { name: "Features", subData: "" },
      { name: "Video", subData: "" },
    ],
    selfie_camera: [
      // { name: "", subData: "" },
      { name: "Features", subData: "" },
      { name: "Video", subData: "" },
    ],
    sound: [
      { name: "Loudspeaker", subData: "" },
      { name: "3.5mm jack", subData: "" },
    ],
    comms: [
      { name: "WLAN", subData: "" },
      { name: "Bluetooth", subData: "" },
      { name: "Positioning", subData: "" },
      { name: "NFC", subData: "" },
      { name: "Radio", subData: "" },
      { name: "USB", subData: "" },
    ],
    features: [{ name: "Sensors", subData: "" }],
    battery: [
      { name: "Type", subData: "" },
      { name: "Wired Charging", subData: "" },
      { name: "Wire Less Charging", subData: "" },
      { name: "Reverse Charging", subData: "" },
    ],
    color: [{ name: "Color", subData: "" }],
    price: [{ name: "Price", subData: "" }],
  });

  const numberOfArrays = Object.keys(inputData).length;

  const handleCameraInput = (section, count = 1) => {
    const updatedData = { ...inputData };

    if (!Array.isArray(updatedData[section])) {
      updatedData[section] = [];
    }

    // Use Array.from to create an array with the specified count
    const newInputs = Array.from({ length: count }, () => ({
      name: "",
      subData: "",
    }));

    // Insert new inputs at the beginning of the array
    updatedData[section] = [...newInputs, ...updatedData[section]];

    setInputData(updatedData);
  };

  const handleAddInput = (section, count = 1) => {
    const updatedData = { ...inputData };

    if (!Array.isArray(updatedData[section])) {
      updatedData[section] = [];
    }

    // Use Array.from to create an array with the specified count
    const newInputs = Array.from({ length: count }, () => ({
      name: "",
      subData: "",
    }));

    updatedData[section] = [...updatedData[section], ...newInputs];
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

  console.log("selectedOption", selectedOption);
  const onSubmit = async (data) => {
    const devicesData = {
      brand: `${selectedOption?.label}`,
      deviceName: `${data.modelName || deviceDataOnly?.deviceName}`,
      release_date: `${data.release_date || deviceDataOnly?.release_date}`,
      banner_img: `${bannerImage || imagePreviewUrl}`,
      galleryPhoto: uploadedPhotoUrls || photoGallery,
      weight: `${data.weight || deviceDataOnly?.weight}`,
      backCamera: `${data.backCamera || deviceDataOnly?.backCamera}`,
      backCameraVideo: `${data.backCameraVideo || deviceDataOnly?.backCameraVideo}`,
      battery: `${data.battery || deviceDataOnly?.battery}`,
      chargingSpeed: `${data.chargingSpeed || deviceDataOnly?.chargingSpeed}`,
      processor: `${data.processor || deviceDataOnly?.processor}`,
      thickness: `${data.thickness || deviceDataOnly?.thickness}`,
      os_android: `${data.os_android || deviceDataOnly?.os_android}`,
      os_brand: `${data.os_brand || deviceDataOnly?.os_brand}`,
      displaySize: `${data.displaySize || deviceDataOnly?.displaySize}`,
      displayResolution: `${data.displayResolution || deviceDataOnly?.displayResolution}`,
      expandable_storage: expandableStorageOption,
      expandable_storage_type: `${data.expandable_storage_type || deviceDataOnly?.expandable_storage_type}`,
      ram: `${data.ram || deviceDataOnly?.release_date}`,
      storage: `${data.storage || deviceDataOnly?.storage}`,
      data: Object.entries(inputData).map(([type, subType]) => ({
        type,
        subType,
      })),
    };
    console.log("devicesData", devicesData);
    try {
      const response = await axios.put(
        `https://deviceinfohub-server.vercel.app/api/devicesData/${id}`, // Use PUT request for updating data
        devicesData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("UpdateResponse", response);
      // Add any further logic or redirection after successful submission
      toast.success('Device updated successfully');
    } catch (error) {
      console.error('Error updating device:', error.response.data);
      // Handle error and display an appropriate message to the user
      toast.error('Error updating device. Please try again later.');
    }
  };
  return (
    <div className="max-w-[1000px] w-full border-[2px] rounded-md">
      <h2 className="py-3 text-center text-xl">Update Device Data</h2>

      <div className="w-full flex justify-center items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-[560px]  flex flex-col justify-center items-center"
        >
          {/* banner data */}
          {step === 1 && (
            <div className="w-full">
              <div className="w-full my-4">
                <p className="py-2 font-raleway font-medium text-lg sm:px-0 px-5">
                  Brand Name
                </p>
                <Select
                  className="basic-single sm:px-0 px-5"
                  classNamePrefix="select"
                  isDisabled={isDisabled}
                  isLoading={isLoading}
                  isClearable={isClearable}
                  isRtl={isRtl}
                  //   defaultValue={selectedOption[0]}
                  isSearchable={isSearchable}
                  name="color"
                  value={selectedOption}
                  options={brandOption}
                  onChange={setSelectedOption}
                />
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

              <div className="w-full">
                <label htmlFor="">Model Name</label>
                <input
                  className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                  defaultValue={deviceDataOnly?.deviceName}
                  type="text"
                  {...register("modelName", {
                    required: {
                      value: true,
                      message: "Enter Your Model Name",
                    },
                  })}
                />
                <label className="label">
                  {errors.modelName?.type === "required" && (
                    <span className="label-text-alt text-red-600">
                      {errors?.modelName?.message}
                    </span>
                  )}
                </label>
              </div>
              <div className="w-full">
                <label className="block" htmlFor="">
                  Release Date
                </label>
                <input
                  className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                  type="text"
                  defaultValue={deviceDataOnly?.release_date}
                  {...register("release_date", {})}
                />
              </div>
              <div className="w-full flex gap-4">
                <div className="w-full">
                  <label htmlFor="">Weight</label>
                  <input
                    className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                    type="text"
                    defaultValue={deviceDataOnly?.weight}
                    {...register("weight", {})}
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="">thickness</label>
                  <input
                    className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                    type="text"
                    defaultValue={deviceDataOnly?.thickness}
                    {...register("thickness", {})}
                  />
                </div>
              </div>
              <div className="w-full flex gap-4">
                <div className="w-full">
                  <label htmlFor="">os_android</label>
                  <input
                    className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                    type="text"
                    defaultValue={deviceDataOnly?.os_android}
                    {...register("os_android", {})}
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="">os_brand</label>
                  <input
                    className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                    type="text"
                    defaultValue={deviceDataOnly?.os_brand}
                    {...register("os_brand", {})}
                  />
                </div>
              </div>
              <div className="w-full flex gap-4">
                <div className="w-full">
                  <label htmlFor="">displaySize</label>
                  <input
                    className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                    type="text"
                    defaultValue={deviceDataOnly?.displaySize}
                    {...register("displaySize", {})}
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="">displayResolution</label>
                  <input
                    className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                    type="text"
                    defaultValue={deviceDataOnly?.displayResolution}
                    {...register("displayResolution", {})}
                  />
                </div>
              </div>
              <div className="flex justify-center gap-4 w-full">
                <div className="w-full">
                  <label htmlFor="expandableStorage">Expandable Storage:</label>
                  <select
                    id="expandableStorage"
                    value={expandableStorageOption}
                    defaultValue={expandableStorageOption}
                    onChange={handleExpandableStorageChange}
                    className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {expandableStorageOption === "yes" && (
                  <div className="w-full">
                    <label htmlFor="expandableStorageType">
                      Expandable Storage Type:
                    </label>
                    <select
                      id="expandableStorageType"
                      value={expandableStorageType}
                      defaultChecked={expandableStorageType}
                      onChange={(e) => setExpandableStorageType(e.target.value)}
                      className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                    >
                      <option value="">Select Storage Type</option>
                      <option value="microSDXC">microSDXC</option>
                      <option value="Nano Memory">Nano Memory</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="w-full flex gap-4">
                <div className="w-full">
                  <label htmlFor="">RAM</label>
                  <input
                    className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                    type="text"
                    defaultValue={deviceDataOnly?.ram}
                    {...register("ram", {
                      required: {
                        value: true,
                        message: "Enter RAM value",
                      },
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Please enter a valid number for RAM",
                      },
                    })}
                  />
                  {errors.ram && (
                    <span className="error-message">{errors.ram.message}</span>
                  )}
                </div>

                <div className="w-full">
                  <label htmlFor="">Storage</label>
                  <input
                    className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                    type="text"
                    defaultValue={deviceDataOnly?.storage}
                    {...register("storage", {
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Please enter a valid number for Storage",
                      },
                    })}
                  />
                </div>
              </div>
              <div className="w-full flex gap-4">
                <div className="w-full">
                  <label htmlFor="">Back Camera</label>
                  <input
                    className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                    type="text"
                    defaultValue={deviceDataOnly?.backCamera}
                    {...register("backCamera", {})}
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="">Back Camera Video</label>
                  <input
                    className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                    type="text"
                    defaultValue={deviceDataOnly?.backCameraVideo}
                    {...register("backCameraVideo", {})}
                  />
                </div>
              </div>
              <div className="w-full flex gap-4">
                <div className="w-full">
                  <label htmlFor="">Battery</label>
                  <input
                    className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                    type="text"
                    defaultValue={deviceDataOnly?.battery}
                    {...register("battery", {})}
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="">Charging Speed</label>
                  <input
                    className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                    type="text"
                    defaultValue={deviceDataOnly?.chargingSpeed}
                    {...register("chargingSpeed", {})}
                  />
                </div>
              </div>
              <div className="w-full flex gap-4">
                <div className="w-full">
                  <label htmlFor="">Processor</label>
                  <input
                    className="max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
                    type="text"
                    defaultValue={deviceDataOnly?.processor}
                    {...register("processor", {})}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <StepFormSection
              sectionName="network"
              sectionData={networkData ? networkData.subType : []}


              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
          )}
          {step === 3 && (
            <StepFormSection
              sectionName="launch"
              sectionData={launchData ? launchData.subType : []}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
          )}
          {step === 4 && (
            <StepFormSection
              sectionName="body"
              sectionData={bodyData ? bodyData.subType : []}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
          )}
          {step === 5 && (
            <StepFormSection
              sectionName="display"
              sectionData={displayData ? displayData.subType : []}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
          )}
          {step === 6 && (
            <StepFormSection
              sectionName="platform"
              sectionData={platformData ? platformData.subType : []}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
          )}
          {step === 7 && (
            <StepFormSection
              sectionName="memory"
              sectionData={memoryData ? memoryData.subType : []}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
          )}
          {step === 8 && (
            <div className="w-full">
              {!showFormSection && (
                <div className="flex flex-col gap-4 w-full">
                  <label htmlFor="back_camera_number">
                    Enter Back Camera Number
                  </label>
                  <input
                    className="h-12 border-[2px] w-full border-gray-500 rounded-md outline-none px-3 appearance-none"
                    type="number"
                    id="back_camera_number"
                    value={backCameraNumber}
                    onChange={(e) =>
                      setBackCameraNumber(
                        Math.max(0, parseInt(e.target.value, 10))
                      )
                    }
                  />
                  <button
                    type="button"
                    className="bg-green-500 rounded-lg w-full text-white text-xs h-12 px-1"
                    onClick={() => handleCreateButtonClick("main_camera")}
                  >
                    Create Input
                  </button>
                </div>
              )}

              {showFormSection && (
                <div>
                  <StepFormSection
                    sectionName="main_camera"
                    sectionData={main_cameraData ? main_cameraData.subType : []}
                    handleInputChange={handleInputChange}
                    handleDeleteInput={handleDeleteInput}
                    handleAddInput={handleAddInput}
                  />
                </div>
              )}
            </div>
          )}
          {step === 9 && (
            <div className="w-full">
              {!showFormSection && (
                <div className="flex flex-col gap-4 w-full">
                  <label htmlFor="front_camera_number">
                    Enter Front Camera Number
                  </label>
                  <input
                    className="h-12 border-[2px] w-full border-gray-500 rounded-md outline-none px-3 appearance-none"
                    type="number"
                    id="front_camera_number"
                    value={frontCameraNumber}
                    onChange={(e) =>
                      setFrontCameraNumber(
                        Math.max(0, parseInt(e.target.value, 10))
                      )
                    }
                  />
                  <button
                    type="button"
                    className="bg-green-500 rounded-lg w-full text-white text-xs h-12 px-1"
                    onClick={() => handleSelfieCameraInput("selfie_camera")}
                  >
                    Create Input
                  </button>
                </div>
              )}
              {showFormSection && (
                <StepFormSection
                  sectionName="selfie_camera"
                  sectionData={selfie_cameraData ? selfie_cameraData.subType : []}
                  handleInputChange={handleInputChange}
                  handleDeleteInput={handleDeleteInput}
                  handleAddInput={handleAddInput}
                />
              )}
            </div>
          )}
          {step === 10 && (
            <StepFormSection
              sectionName="sound"
              sectionData={soundData ? soundData.subType : []}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
          )}
          {step === 11 && (
            <StepFormSection
              sectionName="comms"
              sectionData={commsData ? commsData.subType : []}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
          )}
          {step === 12 && (
            <StepFormSection
              sectionName="features"
              sectionData={featuresData ? featuresData.subType : []}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
          )}
          {step === 13 && (
            <StepFormSection
              sectionName="battery"
              sectionData={batteryData ? batteryData.subType : []}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
          )}
          {step === 14 && (
            <StepFormSection
              sectionName="color"
              sectionData={colorData ? colorData.subType : []}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
          )}
          {step === 15 && (
            <StepFormSection
              sectionName="price"
              sectionData={priceData ? priceData.subType : []}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
          )}
          {step === 16 && (
            <div className="w-full">
              <p className="text-center mt-3 mb-6 text-2xl">Set Photo Gallery</p>

              <div className="flex flex-wrap gap-3">
                {photoGallery.map((photo, index) => (
                  <div className="flex" key={index}>
                    {!photo && (
                      <input
                        type="file"
                        accept="image/*"
                        className="appearance-none max-w-[200px] w-full h-[300px] cursor-pointer relative after:absolute after:max-w-[200px] after:w-full after:h-[300px] after:bg-slate-200 after:top-0 after:left-0 after:right-0 after:bottom-0 after:border-dashed after:border-[2px] after:px-2 after:rounded-lg after:border-black"
                        onChange={(e) => handlePhotoChange(e, index)}
                      />
                    )}
                    {photo && (
                      <div>
                        <div className="relative max-w-[200px] w-full h-[300px] bg-slate-100 border-dashed border-[2px] border-black p-2 rounded-lg">
                          <img
                            src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                            alt={`Preview ${index + 1}`}
                            className="m-0 max-w-[200px] w-full h-[280px] object-contain"
                          />
                          <button
                            type="button"
                            className="absolute top-[-12px] right-[-8px]"
                            onClick={() => handleDeletePhoto(index)}
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
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="max-w-[200px] w-full h-[300px] bg-slate-200 rounded-lg"
                onClick={handleAddPhotoInput}
              >
                Add Photo
              </button>

              {photoGallery.some((photo) => photo) && (
                <button
                  type="button"
                  className="max-w-[200px] w-full h-[50px] bg-blue-500 rounded-lg"
                  onClick={galleryPhotoUpload}
                >
                  Upload All Photos
                </button>
              )}
            </div>
          )}

          {/* main data */}
          {/* submit btn */}
          <div className="w-full flex justify-center items-center gap-5 my-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className=" h-12 bg-gray-500 rounded-md outline-none px-3 text-white cursor-pointer w-full"
              >
                Previous
              </button>
            )}
            {step < 16 && (
              <button
                type="button" // Set the button type to "button" to prevent form submission
                onClick={() => [setStep(step + 1), setShowFormSection(false)]}
                className="h-12 bg-gray-500 rounded-md outline-none px-3 text-white cursor-pointer w-full"
              >
                Next
              </button>
            )}
          </div>
          {step === 16 && (
            <div className="w-full my-6">
              <input
                className="max-w-[560px] h-12 bg-gray-500 rounded-md outline-none px-3 text-white cursor-pointer w-full"
                type="submit"
                value="Submit"
              />
            </div>
          )}

          {/* submit btn */}
        </form>
      </div>
    </div>
  );
};

export default UpdateDevice;
