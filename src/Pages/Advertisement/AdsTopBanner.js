import React, { useState } from "react";
import { useForm, setValue } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";

const AdsTopBanner = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue, // Add this line to get the setValue function
  } = useForm();

  const [selectedOption, setSelectedOption] = useState("photo");
  const [sliderPhotos, setSliderPhotos] = useState([null]);
  const [isPhotoUpdated, setIsPhotoUpdated] = useState(false);


  const addPhotoInput = () => {
    if (sliderPhotos.length < 4) {
      setSliderPhotos([...sliderPhotos, null]);
      setIsPhotoUpdated(false);
    } else {
      toast.error("Maximum number of photos reached (4)");
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
  const removePhotoInput = (index) => {
    const updatedPhotos = [...sliderPhotos];
    updatedPhotos.splice(index, 1);
    setSliderPhotos(updatedPhotos);
    setIsPhotoUpdated(false);

    // Remove the corresponding input value
    const inputName = `sliderImage${index}`;
    setValue(inputName, null);
  };

  
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    setIsPhotoUpdated(false);
  };

  // ... (Your existing functions)

  const uploadImageToImageBB = async (file) => {
    const formData = new FormData();
    formData.append("key", "04ece4ca20ee040e0e21680d6591ddfe");
    formData.append("image", file);

    try {
      const response = await axios.post("https://api.imgbb.com/1/upload", formData);
      console.log("ssssssssssssssssssssss", response);
      if(response.data.success){
        toast.success("Images uploaded successfully!");
      }
      return response.data.data.url;
      
    } catch (error) {
      toast.error("Error uploading images");
      console.error("Error uploading image to ImageBB:", error);
      return null;
    }
  };

  const onSubmit = async (data) => {
    switch (selectedOption) {
      case "photo":
        // Handle photo submission
        break;
      case "video":
        // Handle video submission
        break;
      case "slider":
        // Handle slider submission
        const updatedPhotoLinks = await Promise.all(
          sliderPhotos.map(async (photo, index) => {
            if (photo) {
              const file = await fetch(photo).then((res) => res.blob());
              const imageLink = await uploadImageToImageBB(file);
              return imageLink;
            }
            return null;
          })
        );

        // Save the image links in the state or perform further actions
        console.log("Image Links:", updatedPhotoLinks);
        break;
      default:
        break;
    }
  };


  return (
    <div className=" w-full p-3 border-[2px] rounded-md">
      <h2 className="py-3 text-center text-xl">Add Brand Name</h2>
      <div className="w-full flex justify-center items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full   flex flex-col justify-center items-center"
        >
          <div className="w-full">
            <select
              name="options"
              id="options"
              className=" h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full"
              value={selectedOption}
              onChange={handleOptionChange}
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="slider">Slider</option>
            </select>
          </div>
          {selectedOption == "photo" && (
            <div>
              <input
                type="file"
                accept="image/*"
                className="appearance-none max-w-[200px] w-full h-[300px] cursor-pointer relative after:absolute after:max-w-[200px] after:w-full after:h-[300px] after:bg-slate-200 after:top-0 after:left-0 after:right-0 after:bottom-0 after:border-dashed after:border-[2px] after:px-2 after:rounded-lg after:border-black"
                {...register("bannerImage", {
                  required: "Please select an image",
                })}

                // onChange={(e) => {
                //   setSelectedImage(e.target.files[0]);
                //   previewImage(e.target.files[0]);
                // }}
              />
            </div>
          )}
          {selectedOption === "slider" && (
            <div className="w-full flex gap-3 flex-wrap">
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
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addPhotoInput}
                className="max-w-[200px] w-full h-[300px] bg-slate-200 rounded-lg cursor-pointer my-5 flex justify-center items-center flex-col gap-2"
              >
                <div className="max-w-[64px] h-[64px] w-full rounded-full bg-white flex justify-center items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="40"
                    height="40"
                    fill="rgba(0,0,0,1)"
                  >
                    <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path>
                  </svg>
                </div>
                <p className="text-lg">Add Photo</p>
              </button>
            </div>
          )}

          {isPhotoUpdated && (
            <div className="w-full my-6">
              <button
                type="button"
                className="w-full h-[40px] bg-green-500 text-white rounded-md outline-none px-3 cursor-pointer"
                onClick={handleSubmit(onSubmit)}
              >
                Update All Photos
              </button>
            </div>
          )}
          <div className="w-full my-6">
            <input
              className=" h-12 bg-gray-500 rounded-md outline-none px-3 text-white cursor-pointer w-full"
              type="submit"
              value="Submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdsTopBanner;
