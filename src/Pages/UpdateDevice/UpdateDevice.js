import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../helpers/axios";
import axiosLib from "axios";
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
        const response = await axios.get("brandName");

        const formattedData = response.data.brandNames.map((brand) => ({
          label: brand.name,
          value: brand.name,
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
        const response = await axios.get(`devicesData/${id}`);
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
  const [isBannerDragActive, setIsBannerDragActive] = useState(false);
  const [galleryDragIndex, setGalleryDragIndex] = useState(null);

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

    // Initialize inputData with existing device data
    if (deviceDataOnly && deviceDataOnly.data && Array.isArray(deviceDataOnly.data)) {
      const existingData = {};
      deviceDataOnly.data.forEach(item => {
        if (item.type && item.subType && Array.isArray(item.subType)) {
          existingData[item.type] = item.subType;
        }
      });
      
      // Merge with default inputData, keeping existing data where available
      const mergedData = { ...inputData };
      Object.keys(existingData).forEach(key => {
        if (mergedData[key]) {
          mergedData[key] = existingData[key];
        }
      });
      
      setInputData(mergedData);
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

  const handleCreateButtonClick = (cameraName) => {
    const numberOfInputs = parseInt(backCameraNumber, 10);
    if (isNaN(numberOfInputs) || numberOfInputs <= 0) {
      return;
    }
    handleCameraInput(cameraName, numberOfInputs);
    setShowFormSection(true);
  };

  const handleSelfieCameraInput = (cameraName) => {
    const numberOfInputs = parseInt(frontCameraNumber, 10);
    if (isNaN(numberOfInputs) || numberOfInputs <= 0) {
      return;
    }
    handleCameraInput(cameraName, numberOfInputs);
    setShowFormSection(true);
  };

  const handleExpandableStorageChange = (e) => {
    setExpandableStorageOption(e.target.value);
  };

  const handlePhotoChange = (e, index) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const newGallery = [...photoGallery];
    newGallery[index] = file;
    setPhotoGallery(newGallery);
  };

  const handleDeletePhoto = (index) => {
    const newGallery = [...photoGallery];
    newGallery.splice(index, 1);
    setPhotoGallery(newGallery);
  };

  const handleBannerDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      setSelectedImage(file);
      previewImage(file);
    }
    setIsBannerDragActive(false);
  };

  const handleGalleryDrop = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      const newGallery = [...photoGallery];
      newGallery[index] = file;
      setPhotoGallery(newGallery);
    }
    setGalleryDragIndex(null);
  };

  const handleUploadButtonClick = async () => {
    try {
      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);

        const response = await axiosLib.post(
          "https://api.imgbb.com/1/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              key: process.env.REACT_APP_IMGBB_KEY || "04ece4ca20ee040e0e21680d6591ddfe",
            },
          }
        );

        if (response.data.status === 200) {
          const deleteHash = response.data.data.delete_url;
          const bannerImageRes = response.data.data.display_url;

          setDeleteButtonVisible(true);
          setImageDeleteHash(deleteHash);
          setBannerImage(bannerImageRes);
          toast.success("Image uploaded successfully");
          setIsUploadSuccessful(true);
        } else {
          toast.error("Failed to upload image");
        }
      } else {
        toast.error("Please select an image to upload.", { duration: 4000 });
      }
    } catch (error) {
      console.error("Error uploading image to ImgBB:", error);
      toast.error("Error uploading image. Please try again later.", {
        duration: 4000,
      });
    }
  };

  const handleDeleteButtonClick = async (deleteUrl) => {
    // Image deletion logic can be implemented here
  };

  const handleAddPhotoInput = () => {
    setPhotoGallery((prevGallery) => [...prevGallery, null]);
  };

  const galleryPhotoUpload = async () => {
    const apiKey = process.env.REACT_APP_IMGBB_KEY || "04ece4ca20ee040e0e21680d6591ddfe";
    try {
      const filesToUpload = photoGallery.filter((photo) => photo instanceof File);
      if (filesToUpload.length === 0) {
        toast("No new photos to upload", { icon: "ℹ️" });
        return;
      }

      const uploadPromises = filesToUpload.map(async (photo) => {
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
          setUploadedPhotoUrls((prevUrls) => [...prevUrls, result.data.url]);
        } else {
          toast.error("Failed to upload photo");
        }
      });

      await Promise.all(uploadPromises);
      toast.success("All photos uploaded successfully");
    } catch (error) {
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
      { name: "Features", subData: "" },
      { name: "Video", subData: "" },
    ],
    selfie_camera: [
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
      { name: "WireLess Charging", subData: "" },
      { name: "Reverse Charging", subData: "" },
    ],
    color: [{ name: "Color", subData: "" }],
    price: [{ name: "Price", subData: "" }],
  });

  const handleCameraInput = (section, count = 1) => {
    const updatedData = { ...inputData };
    if (!Array.isArray(updatedData[section])) {
      updatedData[section] = [];
    }
    const newInputs = Array.from({ length: count }, () => ({
      name: "",
      subData: "",
    }));
    updatedData[section] = [...newInputs, ...updatedData[section]];
    setInputData(updatedData);
  };

  const handleAddInput = (section, count = 1) => {
    const updatedData = { ...inputData };
    if (!Array.isArray(updatedData[section])) {
      updatedData[section] = [];
    }
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

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const devicesData = {
        brand: selectedOption?.label,
        deviceName: data.modelName || deviceDataOnly?.deviceName,
        release_date: data.release_date || deviceDataOnly?.release_date,
        banner_img: bannerImage || imagePreviewUrl,
        galleryPhoto: uploadedPhotoUrls || photoGallery,
        weight: data.weight || deviceDataOnly?.weight,
        backCamera: data.backCamera || deviceDataOnly?.backCamera,
        backCameraVideo: data.backCameraVideo || deviceDataOnly?.backCameraVideo,
        battery: data.battery || deviceDataOnly?.battery,
        chargingSpeed: data.chargingSpeed || deviceDataOnly?.chargingSpeed,
        processor: data.processor || deviceDataOnly?.processor,
        thickness: data.thickness || deviceDataOnly?.thickness,
        os_android: data.os_android || deviceDataOnly?.os_android,
        os_brand: data.os_brand || deviceDataOnly?.os_brand,
        displaySize: data.displaySize || deviceDataOnly?.displaySize,
        displayResolution: data.displayResolution || deviceDataOnly?.displayResolution,
        expandable_storage: expandableStorageOption,
        expandable_storage_type: data.expandable_storage_type || deviceDataOnly?.expandable_storage_type,
        ram: data.ram || deviceDataOnly?.ram,
        storage: data.storage || deviceDataOnly?.storage,
        data: Object.entries(inputData).map(([type, subType]) => ({
          type,
          subType,
        })),
      };

      const response = await axios.put(
        `devicesData/${id}`,
        devicesData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Device updated successfully');
    } catch (error) {
      console.error('Error updating device:', error.response?.data);
      toast.error('Error updating device. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!deviceDataOnly) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading device data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Update Device
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Modify device information and specifications
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Device Information */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Basic Device Information
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Core device details and specifications
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Brand Name */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Brand Name
                </label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isDisabled={isDisabled}
                  isLoading={isLoading}
                  isClearable={isClearable}
                  isRtl={isRtl}
                  isSearchable={isSearchable}
                  name="brand"
                  value={selectedOption}
                  options={brandOption}
                  onChange={setSelectedOption}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: 'white',
                      borderColor: '#cbd5e1',
                      borderRadius: '0.5rem',
                      minHeight: '48px',
                    }),
                  }}
                />
              </div>

              {/* Model Name */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Model Name
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  defaultValue={deviceDataOnly?.deviceName}
                  type="text"
                  {...register("modelName", {
                    required: {
                      value: true,
                      message: "Enter Your Model Name",
                    },
                  })}
                />
                {errors.modelName && (
                  <p className="mt-1 text-sm text-red-600">{errors.modelName.message}</p>
                )}
              </div>

              {/* Release Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Release Date
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="text"
                  defaultValue={deviceDataOnly?.release_date}
                  {...register("release_date")}
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Weight
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="text"
                  defaultValue={deviceDataOnly?.weight}
                  {...register("weight")}
                />
              </div>

              {/* Thickness */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Thickness
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="text"
                  defaultValue={deviceDataOnly?.thickness}
                  {...register("thickness")}
                />
              </div>

              {/* OS Android */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  OS Android
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="text"
                  defaultValue={deviceDataOnly?.os_android}
                  {...register("os_android")}
                />
              </div>

              {/* OS Brand */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  OS Brand
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="text"
                  defaultValue={deviceDataOnly?.os_brand}
                  {...register("os_brand")}
                />
              </div>

              {/* Display Size */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Display Size
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="text"
                  defaultValue={deviceDataOnly?.displaySize}
                  {...register("displaySize")}
                />
              </div>

              {/* Display Resolution */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Display Resolution
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="text"
                  defaultValue={deviceDataOnly?.displayResolution}
                  {...register("displayResolution")}
                />
              </div>

              {/* Expandable Storage */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Expandable Storage
                </label>
                <select
                  value={expandableStorageOption}
                  onChange={handleExpandableStorageChange}
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Expandable Storage Type */}
              {expandableStorageOption === "yes" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Storage Type
                  </label>
                  <select
                    value={expandableStorageType}
                    onChange={(e) => setExpandableStorageType(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Storage Type</option>
                    <option value="microSDXC">microSDXC</option>
                    <option value="Nano Memory">Nano Memory</option>
                  </select>
                </div>
              )}

              {/* RAM */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  RAM
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  <p className="mt-1 text-sm text-red-600">{errors.ram.message}</p>
                )}
              </div>

              {/* Storage */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Storage
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="text"
                  defaultValue={deviceDataOnly?.storage}
                  {...register("storage", {
                    pattern: {
                     
                      message: "Please enter a valid number for Storage",
                    },
                  })}
                />
              </div>

              {/* Back Camera */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Back Camera
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="text"
                  defaultValue={deviceDataOnly?.backCamera}
                  {...register("backCamera")}
                />
              </div>

              {/* Back Camera Video */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Back Camera Video
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="text"
                  defaultValue={deviceDataOnly?.backCameraVideo}
                  {...register("backCameraVideo")}
                />
              </div>

              {/* Battery */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Battery
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="text"
                  defaultValue={deviceDataOnly?.battery}
                  {...register("battery")}
                />
              </div>

              {/* Charging Speed */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Charging Speed
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="text"
                  defaultValue={deviceDataOnly?.chargingSpeed}
                  {...register("chargingSpeed")}
                />
              </div>

              {/* Processor */}
              <div className="lg:col-span-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Processor
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="text"
                  defaultValue={deviceDataOnly?.processor}
                  {...register("processor")}
                />
              </div>
            </div>
          </div>

          {/* Device Banner Image */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Device Banner Image
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Upload the main device image
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Select Image
                </label>
                <div
                  onDragEnter={(e) => { e.preventDefault(); setIsBannerDragActive(true); }}
                  onDragOver={(e) => { e.preventDefault(); setIsBannerDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsBannerDragActive(false); }}
                  onDrop={handleBannerDrop}
                  className={`relative w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer ${isBannerDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700'}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    {...register("bannerImage")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (!file) return;
                      setSelectedImage(file);
                      previewImage(file);
                    }}
                  />
                  <div className="pointer-events-none text-center">
                    <div className="font-medium">Drag & drop image here</div>
                    <div className="text-xs">or click to browse</div>
                  </div>
                </div>
                {errors.bannerImage && (
                  <p className="mt-1 text-sm text-red-600">{errors.bannerImage.message}</p>
                )}
              </div>

              <div>
                {imagePreviewUrl && (
                  <div className="text-center">
                    <img
                      className="max-w-full h-48 object-contain rounded-lg border border-slate-200 dark:border-slate-600"
                      src={imagePreviewUrl}
                      alt="Image Preview"
                    />
                  </div>
                )}

                {selectedImage && (
                  <button
                    type="button"
                    onClick={handleUploadButtonClick}
                    disabled={isUploadSuccessful}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
                  >
                    Upload Image
                  </button>
                )}

                {deleteButtonVisible && (
                  <button
                    type="button"
                    className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors mt-2"
                    onClick={() => handleDeleteButtonClick(imageDeleteHash)}
                  >
                    Delete Image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Camera Configuration */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Camera Configuration
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Set up camera specifications
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Back Camera Setup */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Back Camera Number
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="number"
                  value={backCameraNumber}
                  onChange={(e) =>
                    setBackCameraNumber(Math.max(0, parseInt(e.target.value, 10)))
                  }
                />
                <button
                  type="button"
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors mt-2"
                  onClick={() => handleCreateButtonClick("main_camera")}
                >
                  Create Back Camera Inputs
                </button>
              </div>

              {/* Front Camera Setup */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Front Camera Number
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  type="number"
                  value={frontCameraNumber}
                  onChange={(e) =>
                    setFrontCameraNumber(Math.max(0, parseInt(e.target.value, 10)))
                  }
                />
                <button
                  type="button"
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors mt-2"
                  onClick={() => handleSelfieCameraInput("selfie_camera")}
                >
                  Create Front Camera Inputs
                </button>
              </div>
            </div>

            {/* Camera Form Sections */}
            {showFormSection && (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StepFormSection
                  sectionName="main_camera"
                  sectionData={inputData.main_camera}
                  handleInputChange={handleInputChange}
                  handleDeleteInput={handleDeleteInput}
                  handleAddInput={handleAddInput}
                />
                <StepFormSection
                  sectionName="selfie_camera"
                  sectionData={inputData.selfie_camera}
                  handleInputChange={handleInputChange}
                  handleDeleteInput={handleDeleteInput}
                  handleAddInput={handleAddInput}
                />
              </div>
            )}
          </div>

          {/* Other Sections - Wrapped in Single Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StepFormSection
              sectionName="network"
              sectionData={inputData.network}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
            <StepFormSection
              sectionName="launch"
              sectionData={inputData.launch}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
            <StepFormSection
              sectionName="body"
              sectionData={inputData.body}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
            <StepFormSection
              sectionName="display"
              sectionData={inputData.display}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
            <StepFormSection
              sectionName="platform"
              sectionData={inputData.platform}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
            <StepFormSection
              sectionName="memory"
              sectionData={inputData.memory}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
            <StepFormSection
              sectionName="sound"
              sectionData={inputData.sound}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
            <StepFormSection
              sectionName="comms"
              sectionData={inputData.comms}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
            <StepFormSection
              sectionName="features"
              sectionData={inputData.features}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
            <StepFormSection
              sectionName="battery"
              sectionData={inputData.battery}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
            <StepFormSection
              sectionName="color"
              sectionData={inputData.color}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
            <StepFormSection
              sectionName="price"
              sectionData={inputData.price}
              handleInputChange={handleInputChange}
              handleDeleteInput={handleDeleteInput}
              handleAddInput={handleAddInput}
            />
          </div>

          {/* Photo Gallery */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Photo Gallery
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Upload multiple device photos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {photoGallery.map((photo, index) => (
                <div key={index} className="relative">
                  {!photo && (
                    <div
                      onDragEnter={(e) => { e.preventDefault(); setGalleryDragIndex(index); }}
                      onDragOver={(e) => { e.preventDefault(); setGalleryDragIndex(index); }}
                      onDragLeave={(e) => { e.preventDefault(); setGalleryDragIndex(null); }}
                      onDrop={(e) => handleGalleryDrop(e, index)}
                      className={`relative w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${galleryDragIndex === index ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700'}`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handlePhotoChange(e, index)}
                      />
                      <div className="pointer-events-none text-center text-slate-500 dark:text-slate-400">
                        <div className="font-medium">Drag & drop photo here</div>
                        <div className="text-xs">or click to browse</div>
                      </div>
                    </div>
                  )}
                  {photo && (
                    <div className="relative">
                      <img
                        src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        onClick={() => handleDeletePhoto(index)}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 hover:border-indigo-400 transition-colors flex items-center justify-center text-slate-500 dark:text-slate-400"
                onClick={handleAddPhotoInput}
              >
                <span className="text-2xl">+</span>
              </button>
            </div>

            {photoGallery.some((photo) => photo) && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  onClick={galleryPhotoUpload}
                >
                  Upload All Photos
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Updating Device..." : "Update Device"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateDevice;
