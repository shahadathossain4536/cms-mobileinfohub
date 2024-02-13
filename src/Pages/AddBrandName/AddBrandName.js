import React from 'react';
import { useForm } from 'react-hook-form';

const AddBrandName = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const onSubmit = async (data) => {
    console.log(data);
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
              {...register('brandName', {
                required: {
                  value: true,
                  message: 'Enter Your Brand Name',
                },
              })}
            />
            <label className='label'>
              {errors.brandName?.type === 'required' && (
                <span className='label-text-alt text-red-600'>
                  {errors?.brandName?.message}
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
