// StepFormSection.jsx
import React from 'react';

const StepFormSection = ({ sectionName, sectionData, handleInputChange, handleDeleteInput, handleAddInput }) => {


  return (
    <div className='w-full'>
      <p className='uppercase'>{sectionName}</p>
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
          <button onClick={() => handleDeleteInput(sectionName, index)}>Delete</button>
        </div>
      ))}
      <div className='w-full mt-4'>
        <button
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
