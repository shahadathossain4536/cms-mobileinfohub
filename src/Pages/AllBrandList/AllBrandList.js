import React from 'react';
import Loading from '../../component/ui/Loading';
import ErrorState from '../../component/ui/ErrorState';
import Card, { CardHeader, CardContent } from '../../component/ui/Card';
import Button from '../../component/ui/Button';
import { useBrands, useDeleteBrand } from '../../helpers/queries/brandQueries';
import toast from 'react-hot-toast';
import { useQuery, useMutation, queryCache, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';

const AllBrandList = () => {
  const { data: allBrandData, isLoading, isError, refetch } = useBrands();
  const brandDeleteMutation = useDeleteBrand();

  const handleBrandDelete = (id) => {
    // Call the mutation function when delete button is clicked
    brandDeleteMutation.mutate(id);
  };


  if (isLoading) return <Loading label="Loading brands..." />;
  if (isError) return <ErrorState title="Failed to load brands" onRetry={refetch} />;

  return (
    <div className='w-full'>
      <Card className='mb-4'>
        <CardHeader>
          <h2 className='text-lg font-semibold'>All Brands</h2>
        </CardHeader>
        <CardContent>
          <div className='flex w-full h-12 items-center bg-slate-100 dark:bg-slate-700 rounded px-4'>
            <div className='w-[10%]'>
              <p>Image</p>
            </div>
            <div className='w-[40%]'>
              <p>Name</p>
            </div>
            <div className='w-[20%]'>Brand</div>
            <div className='w-[10%]'></div>
            <div className='w-[10%]'></div>
          </div>
        </CardContent>
      </Card>

      {/* Render brand data */}
      <ul>
        {allBrandData && allBrandData.length > 0 ? (
          allBrandData.map((device, index) => (
            <div className='flex w-full h-16 items-center my-2 px-4 border rounded-lg dark:border-slate-700 bg-white dark:bg-slate-800' key={index}>
              <div className='w-[10%]'></div>
              <div className='w-[40%]'>
                <p>{device.name}</p>
              </div>
              <div className='w-[20%]'>{device.brand}</div>
              <div className='w-[10%]'>
                <Link to={`/dashboard/update-device/${device._id}`} className='inline-flex items-center justify-center h-10 w-20 rounded-md bg-green-600 text-white'>Edit</Link>
              </div>
              <div className='w-[10%]'>
                <Button variant='danger' onClick={() => handleBrandDelete(device._id)}>Delete</Button>
              </div>
            </div>
          ))
        ) : (
          <li className='py-10 text-center text-gray-600'>No brands found.</li>
        )}
      </ul>
    </div>
  );
};

export default AllBrandList;
