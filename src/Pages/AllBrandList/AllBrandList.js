import axios from 'axios';
import React from 'react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, queryCache, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';

const fetchData = async () => {
  const response = await axios.get('http://localhost:2000/api/brandName');
  return response.data.brandNames;
};

const deleteBrand = async (id) => {
  await axios.delete(`http://localhost:2000/api/brandName/${id}`);
};

const AllBrandList = () => {
   const queryClient = useQueryClient();
  const { data: allBrandData, isLoading, isError } = useQuery('brandData', fetchData);

  const brandDeleteMutation = useMutation(deleteBrand, {
    onSuccess: () => {
      // Invalidate and refetch the data after successful deletion
      queryClient.invalidateQueries('brandData');

      // Show success toast or any other action
     toast.success('Brand deleted successfully!');
    },
  });

  const handleBrandDelete = (id) => {
    // Call the mutation function when delete button is clicked
    brandDeleteMutation.mutate(id);
  };


  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Error fetching data</p>;
  }

  return (
    <div className='w-full'>
      <h2 className='text-center text-2xl font-inter py-5'>All Brand List</h2>
      <div className='flex w-full h-12 items-center bg-slate-400 bg-opacity-20 px-4'>
        <div className='w-[10%]'>
          <p>Device Image</p>
        </div>
        <div className='w-[40%]'>
          <p>Name</p>
        </div>
        <div className='w-[20%]'>Brand</div>
        <div className='w-[10%]'></div>
        <div className='w-[10%]'></div>
      </div>

      {/* Render your device data here */}
      <ul>
        {allBrandData &&
          allBrandData.map((device, index) => (
            <div className='flex w-full h-12 items-center my-3 px-4 border-b-2 pb-2' key={index}>
              <div className='w-[10%]'></div>
              <div className='w-[40%]'>
                <p>{device.name}</p>
              </div>
              <div className='w-[20%]'>{device.brand}</div>
              <div className='w-[10%]'>
                <Link to={`/dashboard/update-device/${device._id}`} className='h-10 w-20 bg-green-500 text-white cursor-pointer'>
                  Edit
                </Link>
              </div>
              <div className='w-[10%]'>
                <button className='h-10 w-20 bg-red-500 text-white cursor-pointer' onClick={() => handleBrandDelete(device._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
      </ul>
    </div>
  );
};

export default AllBrandList;
