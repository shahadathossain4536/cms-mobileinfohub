// // StepFormSection.jsx
// import React from 'react';

// const StepFormSection = ({ sectionName, sectionData, handleInputChange, handleDeleteInput, handleAddInput }) => {


//   return (
//     <div className='w-full'>
//       <p className='uppercase text-center my-5 text-2xl w-full bg-slate-300 bg-opacity-20 py-2'>{sectionName} data</p>
//       <div className='flex flex-col gap-4'>
//         {sectionData.map((section, index) => (
//           <div key={index} className='flex justify-center items-center gap-2 network-box'>
//             <input
//               className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[30%]'
//               type="text"
//               value={section.name}
//               onChange={(e) => handleInputChange(sectionName, index, 'name', e.target.value)}
//             />
//             <input
//               className='h-12 border-[2px] border-gray-500 rounded-md outline-none px-3 w-full max-w-[70%]'
//               type="text"
//               value={section.subData}
//               onChange={(e) => handleInputChange(sectionName, index, 'subData', e.target.value)}
//             />
//             <button type="button"  className='bg-red-500 rounded-lg text-white max-w-[50px] text-xs w-full h-12 px-1' onClick={() => handleDeleteInput(sectionName, index)}>Delete</button>
//           </div>
//         ))}
//       </div>
//       <div className='w-full mt-4'>
//         <button
//         type="button"
//           className='max-w-[560px] h-12 bg-gray-500 rounded-md outline-none px-3 text-white cursor-pointer w-full'
//           onClick={() => handleAddInput(sectionName)}
//         >
//           Add Input
//         </button>
//       </div>
//     </div>
//   );
// };

// export default StepFormSection;
// StepFormSection.jsx
import React from 'react';

const StepFormSection = ({ sectionName, sectionData, handleInputChange, handleDeleteInput, handleAddInput }) => {
  const renderInputs = () => {
    if (!sectionData || !Array.isArray(sectionData)) return null;

    return sectionData.map((section, index) => (
      <div key={index} className='flex justify-center items-center gap-3 network-box mb-4'>
        <input
          className='h-12 border-2 border-slate-300 dark:border-slate-600 rounded-lg outline-none px-4 w-full max-w-[30%] bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
          type="text"
          placeholder="Field name"
          value={section.name || ''}
          onChange={(e) => handleInputChange(sectionName, index, 'name', e.target.value)}
        />
        <input
          className='h-12 border-2 border-slate-300 dark:border-slate-600 rounded-lg outline-none px-4 w-full max-w-[70%] bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
          type="text"
          placeholder="Field value"
          value={section.subData || ''}
          onChange={(e) => handleInputChange(sectionName, index, 'subData', e.target.value)}
        />
        <button
          type="button"
          className='bg-red-500 hover:bg-red-600 rounded-lg text-white w-12 h-12 flex items-center justify-center transition-colors'
          onClick={() => handleDeleteInput(sectionName, index)}
        >
          ×
        </button>
      </div>
    ));
  };

  return (
    <div className='bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6'>
      <div className='mb-4'>
        <h3 className='text-xl font-semibold text-slate-900 dark:text-white capitalize'>{sectionName.replace('_', ' ')}</h3>
        <p className='text-slate-600 dark:text-slate-400 text-sm'>Manage {sectionName.replace('_', ' ')} specifications</p>
      </div>
      
      <div className='space-y-3'>
        {renderInputs()}
      </div>
      
      <div className='mt-6'>
        <button
          type="button"
          className='w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors'
          onClick={() => handleAddInput(sectionName)}
        >
          + Add {sectionName.replace('_', ' ')} Field
        </button>
      </div>
    </div>
  );
};

export default StepFormSection;
