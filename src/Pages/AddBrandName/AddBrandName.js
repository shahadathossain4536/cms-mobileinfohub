import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster, useToaster } from 'react-hot-toast';

const AddBrandName = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const token = window.localStorage.getItem("token");
  //  const toaster = useToaster();

  const onSubmit = async (data) => {
    try {

      const response = await axios.post('http://localhost:2000/api/brandName', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Show success message using react-hot-toast
      toast.success('Brand name added successfully!', {
        duration: 3000, // Duration in milliseconds
      });

      console.log(response.data);
    } catch (error) {
      // Show error message using react-hot-toast
      toast.error( error?.response?.data.error ? error?.response?.data.error :'Error adding brand name. Please try again.');

      console.error('Error submitting data:', error?.response?.data.error);
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
            <input
              className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full'
              type='text'
              {...register('name', {
                required: {
                  value: true,
                  message: 'Enter Your Brand Name',
                },
              })}
            />
            <label className='label'>
              {errors.name?.type === 'required' && (
                <span className='label-text-alt text-red-600'>
                  {errors?.name?.message}
                </span>
              )}
            </label>
          </div>
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

export default AddBrandName;
