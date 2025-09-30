import axios from "../../helpers/axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import StepFormSection from "../../component/StepFormSection/StepFormSection";
import toast from "react-hot-toast";
import CustomModal from '../../component/CustomModal/CustomModal';
import ImageToJsonModal from '../../component/CustomModal/ImageToJsonModal';
import GsmarenaScraperModal from '../../component/CustomModal/GsmarenaScraperModal';
import Button from '../../component/ui/Button';
import Card, { CardContent } from '../../component/ui/Card';
import Input from '../../component/ui/Input';
import SelectUI from '../../component/ui/Select';

const AddDevices = () => {
  const token = window.localStorage.getItem("token");
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset, // Import reset here
  } = useForm();
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [brandOption, setBrandOption] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [step, setStep] = useState(1);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [photoGallery, setPhotoGallery] = useState([null]);
  console.log("photoGallery", photoGallery);
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jsonFile, setJsonFile] = useState(null);
  const [isImageToJsonOpen, setIsImageToJsonOpen] = useState(false);
  const [isGsmarenaOpen, setIsGsmarenaOpen] = useState(false);
  const steps = [
    "Banner Data",
    "Network",
    "Launch",
    "Body",
    "Display",
    "Platform",
    "Memory",
    "Main Camera",
    "Selfie Camera",
    "Sound",
    "Comms",
    "Features",
    "Battery",
    "Color",
    "Price",
    "Photo Gallery",
  ];

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openImageToJson = () => setIsImageToJsonOpen(true);
  const closeImageToJson = () => setIsImageToJsonOpen(false);
  const openGsmarena = () => setIsGsmarenaOpen(true);
  const closeGsmarena = () => setIsGsmarenaOpen(false);

  const handleJsonFileChange = (e) => {
    const file = e.target.files[0];
    setJsonFile(file);
  };





  // Define the function to handle the Create button click
  const handleCreateButtonClick = (cameraName) => {
    console.log("cameraNamecameraName", cameraName);
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
    console.log("cameraNamecameraName", cameraName);
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

  const handlePhotoChange = (e, index) => {
    const files = e.target.files;
    const filesArray = Array.from(files);

    setPhotoGallery((prevGallery) => {
      const updatedGallery = [...prevGallery];
      updatedGallery[index] = filesArray[0];

      // Check if an image is selected
      const hasImageSelected = updatedGallery.some((photo) => photo !== null);
      setIsImageSelected(hasImageSelected);

      return updatedGallery;
    });
  };

  const handleUploadButtonClick = async () => {
    try {
      // Check if an image is selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);

        const response = await window.axios?.post?.('https://api.imgbb.com/1/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          params: {
            key: process.env.REACT_APP_IMGBB_KEY,
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

    try {
      // Extract delete hash from the delete URL
      const deleteHash = deleteUrl.split('/').pop();
      console.log("deleteHash-------------", deleteHash);

      const apiKey = process.env.REACT_APP_IMGBB_KEY;

      // Send DELETE request to ImgBB API
      const response = await window.axios?.delete?.(`https://api.imgbb.com/1/image/${deleteHash}?key=${apiKey}`);

      if (response.status === 200) {
        // Image deleted successfully, update your component state or take any necessary actions
        toast.success('Image deleted successfully');
        console.log("Image deleted successfully");
      } else {
        toast.error('Failed to delete image');
        console.error("Failed to delete image:", response.data);
      }
    } catch (error) {
      // Log detailed information about the error
      console.error('Error deleting image:', error);

      // Check if the error response is available
      if (error.response) {
        console.error("Error response from ImgBB API:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received from ImgBB API. Request details:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up the request:", error.message);
      }

      toast.error('Error deleting image. Check console for details.');
    }
  };
  const handleDeletePhoto = (index) => {
    setPhotoGallery((prevGallery) => {
      const updatedGallery = [...prevGallery];
      updatedGallery.splice(index, 1);
      return updatedGallery;
    });
  };

  const handleAddPhotoInput = () => {
    setPhotoGallery((prevGallery) => [...prevGallery, null]);
  };
  const galleryPhotoUpload = async () => {
    const apiKey = process.env.REACT_APP_IMGBB_KEY;
    try {
      const uploadPromises = photoGallery.map(async (photo, index) => {
        if (photo) {
          const formData = new FormData();
          formData.append('image', photo);

        const response = await fetch('https://api.imgbb.com/1/upload?key=' + apiKey, {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (result.success) {
            // Photo uploaded successfully, save the URL
            setUploadedPhotoUrls((prevUrls) => [...prevUrls, result.data.url]);
          } else {
            // Photo upload failed, show an error toast
            toast.error('Failed to upload photo');
          }
        }
      });

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // Show success toast after all uploads are complete
      toast.success('All photos uploaded successfully');
    } catch (error) {
      // Handle any errors during the upload process
      console.error('Error uploading photos:', error);
      toast.error('Error uploading photos');
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
  // Handle JSON import and update input data
  const handleJsonImport = (importedData) => {
    if (importedData) {
      // Map imported data to form inputs
      setInputData(importedData.data.reduce((acc, section) => {
        acc[section.type] = section.subType;
        return acc;
      }, {}));

      reset({
        modelName: importedData.deviceName || "",
        release_date: importedData.release_date || "",
        status: importedData.status || "",
        weight: importedData.weight || "",
        thickness: importedData.thickness || "",
        os_android: importedData.os_android || "",
        os_brand: importedData.os_brand || "",
        displaySize: importedData.displaySize || "",
        displayResolution: importedData.displayResolution || "",
        ram: importedData.ram || "",
        storage: importedData.storage || "",
        backCamera: importedData.backCamera || "",
        backCameraVideo: importedData.backCameraVideo || "",
        battery: importedData.battery || "",
        chargingSpeed: importedData.chargingSpeed || "",
        processor: importedData.processor || "",
      });

      setSelectedOption(importedData.brand || "");
      setBannerImage(importedData.banner_img);
      setPhotoGallery(importedData.galleryPhoto || []);
      setExpandableStorageOption(importedData.expandable_storage || "no");
      setExpandableStorageType(importedData.expandable_storage_type || "");

      toast.success("JSON data imported successfully!");
    }
  };


  // Rest of your code remains unchanged...
  const numberOfArrays = Object.keys(inputData).length;

  const handleCameraInput = (section, count = 1) => {
    const updatedData = { ...inputData };

    if (!Array.isArray(updatedData[section])) {
      updatedData[section] = [];
    }

    // Use Array.from to create an array with the specified count
    const newInputs = Array.from({ length: count }, () => ({ name: "", subData: "" }));

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
    const newInputs = Array.from({ length: count }, () => ({ name: "", subData: "" }));

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
  const onSubmit = async (data) => {
    try {
      // Show loading state
      setIsLoading(true);
      
      // Generate href from deviceName
      const href = data.modelName
        .toLowerCase() // Convert to lowercase
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, ''); // Remove any non-alphanumeric characters except hyphens

      const devicesData = {
        brand: `${selectedOption}`,
        deviceName: `${data.modelName}`,
        release_date: data.release_date,
        href: href, // Set the generated href
        status: data.status,
        banner_img: bannerImage,
        galleryPhoto: uploadedPhotoUrls,
        weight: `${data.weight}`,
        backCamera: `${data.backCamera}`,
        backCameraVideo: `${data.backCameraVideo}`,
        battery: `${data.battery}`,
        chargingSpeed: `${data.chargingSpeed}`,
        processor: `${data.processor}`,
        thickness: `${data.thickness}`,
        os_android: `${data.os_android}`,
        os_brand: `${data.os_brand}`,
        displaySize: `${data.displaySize}`,
        displayResolution: `${data.displayResolution}`,
        expandable_storage: expandableStorageOption,
        expandable_storage_type: expandableStorageType,
        ram: `${data.ram}`,
        storage: `${data.storage}`,
        data: Object.entries(inputData).map(([type, subType]) => ({
          type,
          subType,
        })),
      };
      
      console.log("devicesData", devicesData);
      
      const response = await axios.post("devicesData", devicesData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Device added successfully:", response.data);
      toast.success('Device added successfully!');
      
      // Reset form after successful submission
      reset();
      setStep(1);
      setSelectedImage(null);
      setImagePreviewUrl(null);
      setBannerImage(null);
      setPhotoGallery([null]);
      setUploadedPhotoUrls([]);
      setInputData({
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
          { name: "Wire Less Charging", subData: "" },
          { name: "Reverse Charging", subData: "" },
        ],
        color: [{ name: "Color", subData: "" }],
        price: [{ name: "Price", subData: "" }],
      });
      
    } catch (error) {
      console.error("Error adding device:", error.response?.data);
      toast.error('Error adding device. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

// Event handler for Previous button mouse over
const handlePreviousMouseOver = () => {
  // Removed automatic step change on hover
};

// Event handler for Next button mouse over
const handleNextMouseOver = () => {
  // Removed automatic step change on hover
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-2xl border-0">
          <CardContent className="p-8">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Add New Device</h1>
              <p className="text-slate-600 dark:text-slate-400">Fill in all device specifications below</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              <Button 
                variant='secondary' 
                onClick={openModal}
                className="flex items-center gap-2 px-6 py-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6H16a5 5 0 011 9.9M15 13l-3-3-3 3m3-3v12" />
                </svg>
                Import JSON Data
              </Button>
              <Button 
                variant='outline' 
                onClick={openImageToJson}
                className="flex items-center gap-2 px-6 py-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Image to JSON
              </Button>
              <Button 
                variant='primary' 
                onClick={openGsmarena}
                className="flex items-center gap-2 px-6 py-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                </svg>
                Data Scraper (GSMArena)
              </Button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Device Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Basic Device Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-2">
                    <SelectUI 
                      label="Brand Name" 
                      value={selectedOption} 
                      onChange={(e) => setSelectedOption(e.target.value)}
                      required
                    >
                      <option value="">Select brand</option>
                      {brandOption.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </SelectUI>
                  </div>

                  <div className="lg:col-span-2">
                    <Input 
                      label="Model Name" 
                      type="text" 
                      placeholder="e.g., Galaxy S24 Ultra"
                      {...register("modelName", { 
                        required: { value: true, message: "Enter Your Model Name" } 
                      })} 
                      error={errors.modelName?.message}
                      required
                    />
                  </div>

                  <Input 
                    label="Release Date" 
                    type="text" 
                    placeholder="e.g., 2024, January 17"
                    {...register("release_date", {})} 
                  />

                  <SelectUI 
                    label="Status" 
                    {...register('status')}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Available">Available</option>
                    <option value="Coming soon">Coming soon</option>
                  </SelectUI>

                  <Input 
                    label="Weight" 
                    type="text" 
                    placeholder="e.g., 232g"
                    {...register("weight", {})} 
                  />

                  <Input 
                    label="Thickness" 
                    type="text" 
                    placeholder="e.g., 8.6mm"
                    {...register("thickness", {})} 
                  />

                  <Input 
                    label="OS (Android)" 
                    type="text" 
                    placeholder="e.g., Android 14"
                    {...register("os_android", {})} 
                  />

                  <Input 
                    label="OS (Brand)" 
                    type="text" 
                    placeholder="e.g., One UI 6.1"
                    {...register("os_brand", {})} 
                  />

                  <Input 
                    label="Display Size" 
                    type="text" 
                    placeholder="e.g., 6.8 inches"
                    {...register("displaySize", {})} 
                  />

                  <Input 
                    label="Display Resolution" 
                    type="text" 
                    placeholder="e.g., 1440 x 3088"
                    {...register("displayResolution", {})} 
                  />

                  <div className="lg:col-span-2">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <SelectUI 
                          label="Expandable Storage" 
                          id="expandableStorage" 
                          value={expandableStorageOption} 
                          onChange={handleExpandableStorageChange}
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </SelectUI>
                      </div>

                      {expandableStorageOption === "yes" && (
                        <div className="flex-1">
                          <SelectUI 
                            label="Storage Type" 
                            id="expandableStorageType" 
                            value={expandableStorageType} 
                            onChange={(e) => setExpandableStorageType(e.target.value)}
                          >
                            <option value="">Select Type</option>
                            <option value="microSDXC">microSDXC</option>
                            <option value="Nano Memory">Nano Memory</option>
                          </SelectUI>
                        </div>
                      )}
                    </div>
                  </div>

                  <Input 
                    label="RAM" 
                    type="text" 
                    placeholder="e.g., 12"
                    {...register("ram", { 
                      required: { value: true, message: "Enter RAM value" }, 
                      pattern: { value: /^[0-9]+$/, message: "Please enter a valid number for RAM" } 
                    })} 
                    error={errors.ram?.message}
                    required
                  />

                  <Input 
                    label="Storage" 
                    type="text" 
                    placeholder="e.g., 256GB"
                    {...register("storage", { 
                      required: { value: true, message: "Enter Storage value" }, 
                      pattern: { value: /^[0-9]+$/, message: "Please enter a valid number for Storage" } 
                    })} 
                    error={errors.storage?.message}
                    required
                  />

                  <Input 
                    label="Back Camera" 
                    type="text" 
                    placeholder="e.g., 200MP + 12MP + 50MP"
                    {...register("backCamera", {})} 
                  />

                  <Input 
                    label="Back Camera Video" 
                    type="text" 
                    placeholder="e.g., 8K@30fps"
                    {...register("backCameraVideo", {})} 
                  />

                  <Input 
                    label="Battery" 
                    type="text" 
                    placeholder="e.g., 5000mAh"
                    {...register("battery", {})} 
                  />

                  <Input 
                    label="Charging Speed" 
                    type="text" 
                    placeholder="e.g., 45W"
                    {...register("chargingSpeed", {})} 
                  />

                  <div className="lg:col-span-4">
                    <Input 
                      label="Processor" 
                      type="text" 
                      placeholder="e.g., Snapdragon 8 Gen 3"
                      {...register("processor", {})} 
                    />
                  </div>
                </div>
              </div>

              {/* Banner Image Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Device Banner Image
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Upload Image
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        {...register("bannerImage")}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          setSelectedImage(e.target.files[0]);
                          previewImage(e.target.files[0]);
                        }}
                      />
                      <div className="w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:border-brand-primary transition-colors">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Click to upload
                          </p>
                        </div>
                      </div>
                    </div>
                    {errors.bannerImage && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.bannerImage.message}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {imagePreviewUrl && (
                      <div className="relative">
                        <img
                          className="w-full h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                          src={imagePreviewUrl}
                          alt="Banner Preview"
                        />
                      </div>
                    )}

                    {selectedImage && (
                      <div className="space-y-3">
                        <Button
                          type="button"
                          onClick={handleUploadButtonClick}
                          disabled={isUploadSuccessful}
                          className="w-full"
                          loading={isUploadSuccessful}
                        >
                          {isUploadSuccessful ? 'Uploaded' : 'Upload to Server'}
                        </Button>
                        
                        {deleteButtonVisible && (
                          <Button
                            type="button"
                            variant='danger'
                            className="w-full"
                            onClick={() => handleDeleteButtonClick(imageDeleteHash)}
                          >
                            Delete Image
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* All Other Sections in Grid Container */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Network Section */}
                <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                  <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                    Network & Connectivity
                  </h3>
                  <StepFormSection
                    sectionName="network"
                    sectionData={inputData.network}
                    handleInputChange={handleInputChange}
                    handleDeleteInput={handleDeleteInput}
                    handleAddInput={handleAddInput}
                  />
                </div>

                {/* Launch Section */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
                  <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Launch Information
                  </h3>
                  <StepFormSection
                    sectionName="launch"
                    sectionData={inputData.launch}
                    handleInputChange={handleInputChange}
                    handleDeleteInput={handleDeleteInput}
                    handleAddInput={handleAddInput}
                  />
                </div>

                {/* Body Section */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <h3 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                    Body & Design
                  </h3>
                  <StepFormSection
                    sectionName="body"
                    sectionData={inputData.body}
                    handleInputChange={handleInputChange}
                    handleDeleteInput={handleDeleteInput}
                    handleAddInput={handleAddInput}
                  />
                </div>

                {/* Display Section */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
                  <h3 className="text-xl font-semibold text-cyan-900 dark:text-cyan-100 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Display Specifications
                  </h3>
                  <StepFormSection
                    sectionName="display"
                    sectionData={inputData.display}
                    handleInputChange={handleInputChange}
                    handleDeleteInput={handleDeleteInput}
                    handleAddInput={handleAddInput}
                  />
                </div>

                {/* Platform Section */}
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-violet-200 dark:border-violet-800">
                  <h3 className="text-xl font-semibold text-violet-900 dark:text-violet-100 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Platform & Performance
                  </h3>
                  <StepFormSection
                    sectionName="platform"
                    sectionData={inputData.platform}
                    handleInputChange={handleInputChange}
                    handleDeleteInput={handleDeleteInput}
                    handleAddInput={handleAddInput}
                  />
                </div>

                {/* Memory Section */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                  <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    Memory & Storage
                  </h3>
                  <StepFormSection
                    sectionName="memory"
                    sectionData={inputData.memory}
                    handleInputChange={handleInputChange}
                    handleDeleteInput={handleDeleteInput}
                    handleAddInput={handleAddInput}
                  />
                </div>

                {/* Main Camera Section */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-rose-200 dark:border-rose-800">
                  <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    Main Camera
                  </h3>
                  
                  {!showFormSection ? (
                    <div className='space-y-4'>
                      <label htmlFor="back_camera_number" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Enter Back Camera Number
                      </label>
                      <div className="flex gap-4 items-end">
                        <input
                          className='h-12 border-2 w-full max-w-xs border-slate-300 dark:border-slate-600 rounded-lg outline-none px-3 appearance-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                          type="number"
                          id="back_camera_number"
                          value={backCameraNumber}
                          onChange={(e) => setBackCameraNumber(Math.max(0, parseInt(e.target.value, 10)))}
                        />
                        <Button
                          type="button"
                          onClick={() => handleCreateButtonClick("main_camera")}
                          className="px-6"
                        >
                          Create Camera Inputs
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <StepFormSection
                      sectionName="main_camera"
                      sectionData={inputData.main_camera}
                      handleInputChange={handleInputChange}
                      handleDeleteInput={handleDeleteInput}
                      handleAddInput={handleAddInput}
                    />
                  )}
                </div>

                {/* Selfie Camera Section */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <h3 className="text-xl font-semibold text-emerald-900 dark:text-emerald-100 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Selfie Camera
                  </h3>
                  
                  {!showFormSection ? (
                    <div className='space-y-4'>
                      <label htmlFor="front_camera_number" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Enter Front Camera Number
                      </label>
                      <div className="flex gap-4 items-end">
                        <input
                          className='h-12 border-2 w-full max-w-xs border-slate-300 dark:border-slate-600 rounded-lg outline-none px-3 appearance-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                          type="number"
                          id="front_camera_number"
                          value={frontCameraNumber}
                          onChange={(e) => setFrontCameraNumber(Math.max(0, parseInt(e.target.value, 10)))}
                        />
                        <Button
                          type="button"
                          onClick={() => handleSelfieCameraInput("selfie_camera")}
                          className="px-6"
                        >
                          Create Selfie Camera Inputs
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <StepFormSection
                      sectionName="selfie_camera"
                      sectionData={inputData.selfie_camera}
                      handleInputChange={handleInputChange}
                      handleDeleteInput={handleDeleteInput}
                      handleAddInput={handleAddInput}
                    />
                  )}
                </div>

                {/* Sound Section */}
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-sky-200 dark:border-sky-800">
                  <h3 className="text-xl font-semibold text-sky-900 dark:text-sky-100 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    Sound & Audio
                  </h3>
                  <StepFormSection
                    sectionName="sound"
                    sectionData={inputData.sound}
                    handleInputChange={handleInputChange}
                    handleDeleteInput={handleDeleteInput}
                    handleAddInput={handleAddInput}
                  />
                </div>

                {/* Communications Section */}
                <div className="bg-gradient-to-r from-lime-50 to-emerald-50 dark:from-lime-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-lime-200 dark:border-lime-800">
                  <h3 className="text-xl font-semibold text-lime-900 dark:text-lime-100 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                    Communications
                  </h3>
                  <StepFormSection
                    sectionName="comms"
                    sectionData={inputData.comms}
                    handleInputChange={handleInputChange}
                    handleDeleteInput={handleDeleteInput}
                    handleAddInput={handleAddInput}
                  />
                </div>

                {/* Features Section */}
                <div className="bg-gradient-to-r from-fuchsia-50 to-purple-50 dark:from-fuchsia-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-fuchsia-200 dark:border-fuchsia-800">
                  <h3 className="text-xl font-semibold text-fuchsia-900 dark:text-fuchsia-100 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Features & Sensors
                  </h3>
                  <StepFormSection
                    sectionName="features"
                    sectionData={inputData.features}
                    handleInputChange={handleInputChange}
                    handleDeleteInput={handleDeleteInput}
                    handleAddInput={handleAddInput}
                  />
                </div>

                {/* Battery Section */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
                  <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Battery & Charging
                  </h3>
                  <StepFormSection
                    sectionName="battery"
                    sectionData={inputData.battery}
                    handleInputChange={handleInputChange}
                    handleDeleteInput={handleDeleteInput}
                    handleAddInput={handleAddInput}
                  />
                </div>

                {/* Color Section */}
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-6 rounded-xl border border-pink-200 dark:border-pink-800">
                  <h3 className="text-xl font-semibold text-pink-900 dark:text-pink-100 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                    Color Options
                  </h3>
                  <StepFormSection
                    sectionName="color"
                    sectionData={inputData.color}
                    handleInputChange={handleInputChange}
                    handleDeleteInput={handleDeleteInput}
                    handleAddInput={handleAddInput}
                  />
                </div>

                {/* Price Section */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <h3 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Pricing Information
                  </h3>
                  <StepFormSection
                    sectionName="price"
                    sectionData={inputData.price}
                    handleInputChange={handleInputChange}
                    handleDeleteInput={handleDeleteInput}
                    handleAddInput={handleAddInput}
                  />
                </div>
              </div>

              {/* Photo Gallery Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Photo Gallery
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {photoGallery.map((photo, index) => (
                    <div key={index} className="relative">
                      {!photo ? (
                        <div className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:border-brand-primary transition-colors cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => handlePhotoChange(e, index)}
                          />
                          <svg className="h-8 w-8 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={photo instanceof Blob ? URL.createObjectURL(photo) : ""}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                            onLoad={(e) => {
                              URL.revokeObjectURL(e.target.src);
                            }}
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            onClick={() => handleDeletePhoto(index)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    variant='secondary'
                    onClick={handleAddPhotoInput}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Photo
                  </Button>
                  
                  {photoGallery.some(photo => photo) && (
                    <Button
                      type="button"
                      onClick={galleryPhotoUpload}
                      className="flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6H16a5 5 0 011 9.9M15 13l-3-3-3 3m3-3v12" />
                      </svg>
                      Upload All Photos
                    </Button>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="w-full text-center pt-8">
                <Button 
                  type='submit' 
                  className='px-12 py-4 text-lg font-semibold'
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding Device...' : 'Add Device'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onImport={handleJsonImport}
      />

      <ImageToJsonModal 
        isOpen={isImageToJsonOpen} 
        onClose={closeImageToJson} 
        onImport={handleJsonImport} 
      />
      <GsmarenaScraperModal 
        isOpen={isGsmarenaOpen}
        onClose={closeGsmarena}
      />
    </div>
  );
};

export default AddDevices;
