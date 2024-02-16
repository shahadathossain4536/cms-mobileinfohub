import React from 'react';
import { useForm } from 'react-hook-form';

const AddDevicesTest = () => {
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const onSubmit = async (data) => {
console.log(data);
  }
  return (
    <div className='max-w-[1000px] w-full border-[2px] rounded-md'>




      <h2 className='py-3 text-center text-xl'>Add Device</h2>

      <div className='w-full flex justify-center items-center'>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='w-full max-w-[560px]  flex flex-col justify-center items-center'
        >

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

export default AddDevicesTest;