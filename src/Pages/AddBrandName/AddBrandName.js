import React from 'react';

const AddBrandName = () => {
  return (

      <div className='max-w-[600px] w-full border-[2px] rounded-md'>
        <h2 className='py-3 text-center text-xl'>Add Brand Name</h2>
        <div className='w-full flex justify-center items-center'>
          <form className='w-full max-w-[560px]  flex flex-col justify-center items-center'>
            <div className='w-full'>
              <label htmlFor=""></label>
              <input className='max-w-[560px] h-12 border-[2px] border-gray-500 rounded-md outline-none px-3  w-full' type="text" />
            </div>
            <div className='w-full my-6'>
              <input className='max-w-[560px] h-12  bg-gray-500 rounded-md outline-none px-3 text-white cursor-pointer  w-full' type="button" value="Submit" />
            </div>
        </form>
        </div>
      </div>

  );
};

export default AddBrandName;