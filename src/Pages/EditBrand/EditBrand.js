import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../helpers/axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Button from "../../component/ui/Button";
import Card, { CardContent, CardHeader } from "../../component/ui/Card";

const EditBrand = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = window.localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [brandData, setBrandData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  // Fetch brand data on component mount
  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        const response = await axios.get(`brandName/${id}`);
        const data = response.data.brand;
        setBrandData(data);
        
        // Set form values
        setValue("name", data.name);
        if (typeof data.order === 'number') {
          setValue("order", data.order);
        }
        if (data.brandBannerImg) {
          setImagePreviewUrl(data.brandBannerImg);
        }
      } catch (error) {
        console.error("Error fetching brand data:", error);
        toast.error("Failed to load brand data");
      }
    };

    if (id) {
      fetchBrandData();
    }
  }, [id, setValue]);

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.order !== undefined && data.order !== null && String(data.order).trim() !== '') {
        formData.append("order", Number(data.order));
      }
      
      if (selectedImage) {
        formData.append("brandBannerImg", selectedImage);
      }

      const response = await axios.put(`brandName/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        toast.success("Brand updated successfully!");
        navigate("/dashboard/all-brand-list");
      }
    } catch (error) {
      console.error("Error updating brand:", error);
      const errorMessage = error.response?.data?.error || "Failed to update brand";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!brandData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Brand
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update brand information and banner image
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Brand name is required" })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter brand name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  {...register("order", { valueAsNumber: true, min: { value: 0, message: "Order must be >= 0" } })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter display order"
                />
                {errors.order && (
                  <p className="mt-1 text-sm text-red-600">{errors.order.message}</p>
                )}
              </div>

              {/* Brand Banner Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand Banner Image
                </label>
                <div className="space-y-4">
                  {/* Current Image Preview */}
                  {imagePreviewUrl && (
                    <div className="relative">
                      <img
                        src={imagePreviewUrl}
                        alt="Current brand banner"
                        className="w-full h-32 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  )}
                  
                  {/* Image Upload */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Leave empty to keep current image
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? "Updating..." : "Update Brand"}
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate("/dashboard/all-brand-list")}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditBrand;
