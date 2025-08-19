import React, { useEffect, useState } from 'react';
import axiosInstance from '../../helpers/axios';
import Loading from '../../component/ui/Loading';
import ErrorState from '../../component/ui/ErrorState';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card, { CardHeader, CardContent } from '../../component/ui/Card';
import Button from '../../component/ui/Button';
import { useDevices, useDeleteDevice } from '../../helpers/queries/deviceQueries';
const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete this device?</p>
        <div className="flex justify-end mt-6">
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AllDeviceList = () => {
  const { data: devicesData, isLoading, isError, refetch } = useDevices();
  const deleteDeviceMutation = useDeleteDevice();
  const allDeviceData = devicesData || [];
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedDevices, setSelectedDevices] = useState([]);
console.log("deleteId",deleteId);
  useEffect(() => {
    if (allDeviceData?.length != null) {
      setTotalPages(Math.ceil(allDeviceData.length / itemsPerPage));
    }
  }, [allDeviceData, itemsPerPage]);

  const openModal = (id) => {
    setDeleteId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDeleteId(null);
  };

const handleConfirmDelete = async () => {
  try {
    const token = window.localStorage.getItem("token"); // Retrieve the token from localStorage
    await deleteDeviceMutation.mutateAsync(deleteId);
    refetch();
    closeModal();

    // Show success toast
    toast.success('Device deleted successfully');
  } catch (error) {
    console.error('Error deleting device:', error.message);
    // Optionally, you could show an error toast here as well
    toast.error('Failed to delete device. Please try again.');
  }
};

  const handleDeleteSelected = async () => {
    try {
      const token = window.localStorage.getItem("token");
      await Promise.all(selectedDevices.map(id => deleteDeviceMutation.mutateAsync(id)));
      refetch();
      setSelectedDevices([]);
      toast.success('Selected devices deleted successfully');
    } catch (error) {
      console.error('Error deleting selected devices:', error.message);
      toast.error('Failed to delete selected devices. Please try again.');
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allDeviceData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const firstPages = [1, 2];
    const lastPages = [totalPages - 1, totalPages];

    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage > 4) {
        pageNumbers.push(1, 2, '...');
      }
      for (let i = Math.max(3, currentPage - 2); i <= Math.min(currentPage + 2, totalPages - 2); i++) {
        pageNumbers.push(i);
      }
      if (currentPage < totalPages - 3) {
        pageNumbers.push('...', totalPages - 1, totalPages);
      } else {
        pageNumbers.push(totalPages - 1, totalPages);
      }
    }

    return pageNumbers.map((number, index) =>
      number === '...' ? (
        <span key={index} className="px-3 py-1 mx-1">...</span>
      ) : (
        <button
          key={index}
          onClick={() => handlePageChange(number)}
          className={`px-3 py-1 mx-1 rounded ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
        >
          {number}
        </button>
      )
    );
  };

  const handleSelectDevice = (id) => {
    setSelectedDevices((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((deviceId) => deviceId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDevices.length === currentItems.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(currentItems.map((device) => device._id));
    }
  };

  return (
    <div className='w-full'>
      {isLoading && <Loading label="Loading devices..." />}
      {!isLoading && isError && <ErrorState title="Failed to load devices" onRetry={refetch} />}
      {!isLoading && !isError && (
      <>
      <Card className='mb-4'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>All Devices</h2>
            <div className='flex items-center gap-3'>
              <label htmlFor="itemsPerPage" className="text-sm">Per page</label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border px-2 py-1 rounded bg-white dark:bg-slate-800"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={50}>50</option>
              </select>
              <Button variant='danger' onClick={handleDeleteSelected} disabled={selectedDevices.length === 0}>Delete Selected</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex w-full h-12 items-center bg-slate-100 dark:bg-slate-700 rounded px-4'>
            <div className='w-[5%]'>
              <input
                type="checkbox"
                checked={selectedDevices.length === currentItems.length}
                onChange={handleSelectAll}
              />
            </div>
            <div className='w-[10%]'><p>Device Image</p></div>
            <div className='w-[40%]'><p>Name</p></div>
            <div className='w-[20%]'>Brand</div>
            <div className='w-[10%]'></div>
            <div className='w-[10%]'></div>
          </div>
        </CardContent>
      </Card>

      <ul>
        {currentItems.length === 0 ? (
          <li className='py-10 text-center text-gray-600'>No devices found.</li>
        ) : currentItems.map((device, index) => (
          <div className='flex w-full h-16 items-center my-2 px-4 border rounded-lg dark:border-slate-700 bg-white dark:bg-slate-800' key={index}>
            <div className='w-[5%]'>
              <input
                type="checkbox"
                checked={selectedDevices.includes(device._id)}
                onChange={() => handleSelectDevice(device._id)}
              />
            </div>
            <div className='w-[10%]'>
              <img className='w-10 h-10 object-contain' src={device.banner_img} alt="" />
            </div>
            <div className='w-[40%]'>
              <p>{device.deviceName}</p>
            </div>
            <div className='w-[20%]'>{device.brand}</div>
            <div className='w-[10%]'>
              <Link to={`/dashboard/update-device/${device._id}`} className='inline-flex items-center justify-center h-10 w-20 rounded-md bg-green-600 text-white'>Edit</Link>
            </div>
            <div className='w-[10%]'>
              <Button variant='danger' onClick={() => openModal(device._id)}>Delete</Button>
            </div>
          </div>
        ))}
      </ul>

      <div className='flex justify-center mt-4'>
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className='px-3 py-1 mx-1 rounded bg-gray-300'
        >
          First
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='px-3 py-1 mx-1 rounded bg-gray-300'
        >
          Previous
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='px-3 py-1 mx-1 rounded bg-gray-300'
        >
          Next
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className='px-3 py-1 mx-1 rounded bg-gray-300'
        >
          Last
        </button>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
      />
      </>
      )}
    </div>
  );
};

export default AllDeviceList;
