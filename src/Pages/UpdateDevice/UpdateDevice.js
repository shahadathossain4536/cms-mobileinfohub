import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../helpers/axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import StepFormSection from "../../component/StepFormSection/StepFormSection";
import SelectUI from "../../component/ui/Select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UpdateDevice = () => {
  // Helper function to generate unique IDs (moved to top to avoid hoisting issues)
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

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
        const response = await axios.get("brandName?limit=100");

        const formattedData = (response.data?.brandNames || []).map((brand) => ({
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
  const [selectedOption, setSelectedOption] = useState("");
  const [brandOption, setBrandOption] = useState([]); // [{label, value}]
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState();
  const [photoGallery, setPhotoGallery] = useState([null]);
  const [startDate, setStartDate] = useState(null);
  const [expandableStorageOption, setExpandableStorageOption] = useState("no");
  const [expandableStorageType, setExpandableStorageType] = useState("");
  const [backCameraNumber, setBackCameraNumber] = useState();
  const [frontCameraNumber, setFrontCameraNumber] = useState();
  const [showFormSection, setShowFormSection] = useState(false);
  const [isBannerDragActive, setIsBannerDragActive] = useState(false);
  const [galleryDragIndex, setGalleryDragIndex] = useState(null);

  // New state for storage variants
  const [storageVariants, setStorageVariants] = useState([
    {
      variantId: generateId(),
      rom: "",
      ram: "",
      price: "",
      currency: "BDT",
      availability: "Available"
    }
  ]);

  // New state for web visibility
  const [webVisibility, setWebVisibility] = useState(true);

  useEffect(() => {
    // Initialize selected brand to string value to match AddDevices UI
    if (deviceDataOnly?.brand) {
      setSelectedOption(deviceDataOnly.brand);
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

    // Helper to parse ROM/RAM pairs from a label like "128GB + 8GB"
    const parseRomRamFromName = (name) => {
      if (!name || typeof name !== 'string') return null;
      const romMatch = name.match(/(\d+(?:\.\d+)?)\s*(GB|TB)/i);
      const ramMatch = name.match(/(\d+(?:\.\d+)?)\s*GB/i);
      if (romMatch && ramMatch) {
        const rom = `${romMatch[1]}${romMatch[2].toUpperCase()}`;
        const ram = `${ramMatch[1]}GB`;
        return { rom, ram };
      }
      return null;
    };

    // Fallback: derive storageVariants from price or memory sections when missing/empty
    const deriveVariantsFromData = (device) => {
      if (!device || !Array.isArray(device.data)) return [];
      // Prefer price section if present
      const priceSection = device.data.find((s) => s.type === 'price');
      if (priceSection && Array.isArray(priceSection.subType)) {
        const variants = priceSection.subType
          .map((item) => {
            const parsed = parseRomRamFromName(item?.name);
            if (!parsed) return null;
            return {
              variantId: item?.variantId || generateId(),
              rom: parsed.rom,
              ram: parsed.ram,
              price: item?.subData || '',
              currency: 'BDT',
              availability: 'Available',
            };
          })
          .filter(Boolean);
        if (variants.length > 0) return variants;
      }
      // Fallback to memory->Internal line parsing if price not available
      const memorySection = device.data.find((s) => s.type === 'memory');
      if (memorySection && Array.isArray(memorySection.subType)) {
        const internal = memorySection.subType.find((i) =>
          typeof i?.name === 'string' && i.name.toLowerCase().includes('internal')
        );
        const internalText = internal?.subData || '';
        if (internalText) {
          const parts = internalText
            .split(',')
            .map((p) => p.trim())
            .filter((p) => p.length > 0);
          const variants = parts
            .map((chunk) => {
              const romMatch = chunk.match(/(\d+(?:\.\d+)?)\s*(GB|TB)/i);
              const ramMatch = chunk.match(/(\d+(?:\.\d+)?)\s*GB\s*RAM/i);
              if (romMatch && ramMatch) {
                return {
                  variantId: generateId(),
                  rom: `${romMatch[1]}${romMatch[2].toUpperCase()}`,
                  ram: `${ramMatch[1]}GB`,
                  price: '',
                  currency: 'BDT',
                  availability: 'Available',
                };
              }
              return null;
            })
            .filter(Boolean);
          return variants;
        }
      }
      return [];
    };

    // Handle storage variants with robust fallback
    if (deviceDataOnly) {
      if (Array.isArray(deviceDataOnly.storageVariants) && deviceDataOnly.storageVariants.length > 0) {
        setStorageVariants(
          deviceDataOnly.storageVariants.map((variant) => ({
            ...variant,
            variantId: variant.variantId || generateId(),
          }))
        );
      } else {
        const derived = deriveVariantsFromData(deviceDataOnly);
        if (derived.length > 0) {
          setStorageVariants(derived);
        }
      }
    }

    // Handle web visibility
    if (deviceDataOnly && deviceDataOnly.webVisibility !== undefined) {
      setWebVisibility(deviceDataOnly.webVisibility);
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

  // ImgBB functionality removed - images now upload directly to server

  const handleAddPhotoInput = () => {
    setPhotoGallery((prevGallery) => [...prevGallery, null]);
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

  // New handler functions for storage variants
  const handleAddStorageVariant = () => {
    const newVariant = {
      variantId: generateId(),
      rom: "",
      ram: "",
      price: "",
      currency: "BDT",
      availability: "Available"
    };
    setStorageVariants([...storageVariants, newVariant]);
  };

  const handleRemoveStorageVariant = (variantId) => {
    setStorageVariants(storageVariants.filter(v => v.variantId !== variantId));
  };

  const handleUpdateStorageVariant = (variantId, field, value) => {
    setStorageVariants(storageVariants.map(v => 
      v.variantId === variantId ? { ...v, [field]: value } : v
    ));
  };

  // Note: Price inputs will be auto-generated by backend based on storage variants

  // Handle web visibility toggle
  const handleWebVisibilityChange = (value) => {
    setWebVisibility(value);
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      
      // Add text fields
      formData.append('brand', selectedOption);
      formData.append('deviceName', data.modelName || deviceDataOnly?.deviceName);
      formData.append('release_date', data.release_date || deviceDataOnly?.release_date);
      formData.append('weight', data.weight || deviceDataOnly?.weight || '');
      formData.append('backCamera', data.backCamera || deviceDataOnly?.backCamera || '');
      formData.append('backCameraVideo', data.backCameraVideo || deviceDataOnly?.backCameraVideo || '');
      formData.append('battery', data.battery || deviceDataOnly?.battery || '');
      formData.append('chargingSpeed', data.chargingSpeed || deviceDataOnly?.chargingSpeed || '');
      formData.append('processor', data.processor || deviceDataOnly?.processor || '');
      formData.append('thickness', data.thickness || deviceDataOnly?.thickness || '');
      formData.append('os_android', data.os_android || deviceDataOnly?.os_android || '');
      formData.append('os_brand', data.os_brand || deviceDataOnly?.os_brand || '');
      formData.append('displaySize', data.displaySize || deviceDataOnly?.displaySize || '');
      formData.append('displayResolution', data.displayResolution || deviceDataOnly?.displayResolution || '');
      formData.append('expandable_storage', expandableStorageOption);
      formData.append('expandable_storage_type', data.expandable_storage_type || deviceDataOnly?.expandable_storage_type || '');
      formData.append('ram', data.ram || deviceDataOnly?.ram || '');
      formData.append('storage', data.storage || deviceDataOnly?.storage || '');
      formData.append('webVisibility', webVisibility);
      
      // Add storage variants as JSON string
      formData.append('storageVariants', JSON.stringify(storageVariants));
      
      // Add device data as JSON string
      const deviceData = Object.entries(inputData).map(([type, subType]) => ({
        type,
        subType,
      }));
      formData.append('data', JSON.stringify(deviceData));
      
      // Handle banner image - direct file upload
      if (selectedImage) {
        // New image selected, upload it
        formData.append('banner_img', selectedImage);
      } else if (imagePreviewUrl && !imagePreviewUrl.startsWith('data:')) {
        // Keep existing URL (not base64 preview)
        formData.append('banner_img_url', imagePreviewUrl);
      }
      
      // Handle gallery photos - direct file upload
      photoGallery.forEach((photo) => {
        if (photo instanceof File) {
          // New file to upload
          formData.append('galleryPhoto', photo);
        } else if (typeof photo === 'string' && !photo.startsWith('data:')) {
          // Existing URL (not base64)
          formData.append('galleryPhoto_urls', photo);
        }
      });

      const response = await axios.put(
        `devicesData/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - axios will set it automatically with boundary
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
                <SelectUI 
                  className="basic-single"
                  id="brand"
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                >
                  <option value="">Select brand</option>
                  {brandOption.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </SelectUI>
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

          {/* Web Visibility Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Web Visibility Settings
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Control whether this device appears on the public website
              </p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Show on Website</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Control whether this device appears on the public website
                </p>
              </div>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={webVisibility}
                    onChange={(e) => handleWebVisibilityChange(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-slate-900 dark:text-white">
                    {webVisibility ? 'Visible' : 'Hidden'}
                  </span>
                </label>
              </div>
            </div>
            
            {!webVisibility && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      This device will be hidden from the public website but will remain accessible in the admin panel.
                    </p>
                  </div>
                </div>
              </div>
            )}
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
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {selectedImage ? 'New image will be uploaded on submit' : 'Current banner image'}
                    </p>
                  </div>
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
            {/* Price section removed - auto-generated by backend from storageVariants */}
          </div>

          {/* Storage Variants Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Memory & Storage Variants
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Manage multiple ROM+RAM combinations with individual pricing
              </p>
            </div>
            
            {/* Dynamic variant inputs */}
            {storageVariants.map((variant, index) => (
              <div key={variant.variantId} className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      ROM
                    </label>
                    <input
                      className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., 64GB"
                      value={variant.rom}
                      onChange={(e) => handleUpdateStorageVariant(variant.variantId, 'rom', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      RAM
                    </label>
                    <input
                      className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., 4GB"
                      value={variant.ram}
                      onChange={(e) => handleUpdateStorageVariant(variant.variantId, 'ram', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Price
                    </label>
                    <input
                      className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., 25000 BDT"
                      value={variant.price}
                      onChange={(e) => handleUpdateStorageVariant(variant.variantId, 'price', e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Availability
                      </label>
                      <select
                        className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={variant.availability}
                        onChange={(e) => handleUpdateStorageVariant(variant.variantId, 'availability', e.target.value)}
                      >
                        <option value="Available">Available</option>
                        <option value="Coming Soon">Coming Soon</option>
                        <option value="Discontinued">Discontinued</option>
                      </select>
                    </div>
                    {storageVariants.length > 1 && (
                      <button
                        type="button"
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                        onClick={() => handleRemoveStorageVariant(variant.variantId)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              onClick={handleAddStorageVariant}
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Storage Variant
            </button>
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

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 Gallery photos will be uploaded directly to the server when you click "Update Device"
              </p>
            </div>
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
