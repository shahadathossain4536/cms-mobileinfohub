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
              <p>Brand Name</p>
            </div>
            <div className='w-[20%]'>Created Date</div>
            <div className='w-[10%]'>Actions</div>
            <div className='w-[10%]'>Actions</div>
          </div>
        </CardContent>
      </Card>

      {/* Render brand data */}
      <ul>
        {allBrandData && allBrandData.length > 0 ? (
          allBrandData.map((brand, index) => (
            <div className='flex w-full h-16 items-center my-2 px-4 border rounded-lg dark:border-slate-700 bg-white dark:bg-slate-800' key={index}>
              <div className='w-[10%]'>
                {brand.brandBannerImg && (
                  <img 
                    src={brand.brandBannerImg} 
                    alt={brand.name}
                    className='w-8 h-8 object-cover rounded'
                  />
                )}
              </div>
              <div className='w-[40%]'>
                <p className='font-medium'>{brand.name}</p>
              </div>
              <div className='w-[20%]'>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className='w-[10%]'>
                <Link 
                  to={`/dashboard/edit-brand/${brand._id}`} 
                  className='inline-flex items-center justify-center h-10 w-20 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors'
                >
                  Edit
                </Link>
              </div>
              <div className='w-[10%]'>
                <Button 
                  variant='danger' 
                  onClick={() => handleBrandDelete(brand._id)}
                  className='h-10 w-20'
                >
                  Delete
                </Button>
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
