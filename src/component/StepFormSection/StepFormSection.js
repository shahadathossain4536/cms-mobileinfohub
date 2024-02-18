// StepFormSection.jsx
import React from 'react';

const StepFormSection = ({ sectionName, sectionData, handleInputChange, handleDeleteInput, handleAddInput }) => {


  return (
    <div className='w-full'>
      <p className='uppercase text-center my-5 text-2xl w-full bg-slate-300 bg-opacity-20 py-2'>{sectionName} data</p>
      <div className='flex flex-col gap-4'>
        {sectionData.map((section, index) => (
          <div key={index} className='flex justify-center items-center gap-2 network-box'>
            <input
              className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[30%]'
              type="text"
              value={section.name}
              onChange={(e) => handleInputChange(sectionName, index, 'name', e.target.value)}
            />
            <input
              className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[70%]'
              type="text"
              value={section.subData}
              onChange={(e) => handleInputChange(sectionName, index, 'subData', e.target.value)}
            />
            <button type="button"  className='bg-red-500 rounded-lg text-white max-w-[50px] text-xs w-full h-12 px-1' onClick={() => handleDeleteInput(sectionName, index)}>Delete</button>
          </div>
        ))}
      </div>
      <div className='w-full mt-4'>
        <button
        type="button" 
          className='max-w-[560px] h-12 bg-gray-500 rounded-md outline-none px-3 text-white cursor-pointer w-full'
          onClick={() => handleAddInput(sectionName)}
        >
          Add Input
        </button>
      </div>
    </div>
  );
};

export default StepFormSection;
