import React from 'react';
import Loading from '../../component/ui/Loading';
import ErrorState from '../../component/ui/ErrorState';
import Card, { CardHeader, CardContent } from '../../component/ui/Card';
import Button from '../../component/ui/Button';
import Pagination from '../../component/ui/Pagination';
import { useBrandsPaginated, useDeleteBrand } from '../../helpers/queries/brandQueries';
import { usePagination } from '../../helpers/hooks/usePagination';
import { Link } from 'react-router-dom';

const AllBrandList = () => {
  // Pagination state using custom hook
  const {
    currentPage,
    limit,
    search,
    sortBy,
    sortOrder,
    handlePageChange,
    handleSearch,
  } = usePagination(1, 10, '', 'order', 'desc');

  // Use paginated query
  const { 
    data: brandData, 
    isLoading, 
    isError, 
    refetch 
  } = useBrandsPaginated(currentPage, limit, search, sortBy, sortOrder);

  const brandDeleteMutation = useDeleteBrand();

  const handleBrandDelete = (id) => {
    // Call the mutation function when delete button is clicked
    brandDeleteMutation.mutate(id);
  };

  const handleSearchInput = (e) => {
    handleSearch(e.target.value);
  };

  // Extract data from response
  const allBrandData = brandData?.brandNames || [];
  const pagination = brandData?.pagination || {};


  if (isLoading) return <Loading label="Loading brands..." />;
  if (isError) return <ErrorState title="Failed to load brands" onRetry={refetch} />;

  return (
    <div className='w-full'>
      <Card className='mb-4'>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <h2 className='text-lg font-semibold'>All Brands</h2>
            <div className='flex items-center space-x-4'>
              <div className='text-sm text-slate-600 dark:text-slate-400'>
                Total: {pagination.totalBrands || 0} brands
              </div>
              <div className='text-sm text-slate-600 dark:text-slate-400'>
                Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className='mb-4'>
            <input
              type='text'
              placeholder='Search brands...'
              value={search}
              onChange={handleSearchInput}
              className='w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
            />
          </div>

          {/* Table Header */}
          <div className='flex w-full h-12 items-center bg-slate-100 dark:bg-slate-700 rounded px-4'>
            <div className='w-[10%]'>
              <p className='font-medium'>Image</p>
            </div>
            <div className='w-[40%]'>
              <p className='font-medium'>Brand Name</p>
            </div>
            <div className='w-[20%]'>
              <p className='font-medium'>Created Date</p>
            </div>
            <div className='w-[15%]'>
              <p className='font-medium'>Edit</p>
            </div>
            <div className='w-[15%]'>
              <p className='font-medium'>Delete</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render brand data */}
      <div className='space-y-2'>
        {allBrandData && allBrandData.length > 0 ? (
          allBrandData.map((brand, index) => (
            <div className='flex w-full h-16 items-center my-2 px-4 border rounded-lg dark:border-slate-700 bg-white dark:bg-slate-800' key={brand._id}>
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
              <div className='w-[15%]'>
                <Link 
                  to={`/dashboard/edit-brand/${brand._id}`} 
                  className='inline-flex items-center justify-center h-10 w-20 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors'
                >
                  Edit
                </Link>
              </div>
              <div className='w-[15%]'>
                <Button 
                  variant='danger' 
                  onClick={() => handleBrandDelete(brand._id)}
                  className='h-10 w-20'
                  disabled={brandDeleteMutation.isLoading}
                >
                  {brandDeleteMutation.isLoading ? '...' : 'Delete'}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className='py-10 text-center text-gray-600 dark:text-gray-400'>
            {search ? `No brands found matching "${search}"` : 'No brands found.'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className='mt-6'>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AllBrandList;
