import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
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
  const [allDeviceData, setAllDeviceData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
console.log("deleteId",deleteId);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://mobile-project-server.onrender.com/api/devicesData');
        setAllDeviceData(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();
  }, [itemsPerPage]);

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
    await axios.delete(`https://mobile-project-server.onrender.com/api/devicesData/${deleteId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
    });
    setAllDeviceData(allDeviceData.filter(device => device._id !== deleteId));
    closeModal();

    // Show success toast
    toast.success('Device deleted successfully');
  } catch (error) {
    console.error('Error deleting device:', error.message);
    // Optionally, you could show an error toast here as well
    toast.error('Failed to delete device. Please try again.');
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

  return (
    <div className='w-full'>
      <h2 className='text-center text-2xl font-inter py-5'>All Device List</h2>

      <div className='flex justify-end mb-4'>
        <label htmlFor="itemsPerPage" className="mr-2">Items per page:</label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="border px-2 py-1 rounded"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={40}>40</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className='flex w-full h-12 items-center bg-slate-400 bg-opacity-20 px-4'>
        <div className='w-[10%]'><p>Device Image</p></div>
        <div className='w-[40%]'><p>Name</p></div>
        <div className='w-[20%]'>Brand</div>
        <div className='w-[10%]'></div>
        <div className='w-[10%]'></div>
      </div>

      <ul>
        {currentItems.map((device, index) => (
          <div className='flex w-full h-12 items-center my-3 px-4 border-b-2 pb-2' key={index}>
            <div className='w-[10%]'>
              <img className='w-10 h-10 object-contain' src={device.banner_img} alt="" />
            </div>
            <div className='w-[40%]'>
              <p>{device.deviceName}</p>
            </div>
            <div className='w-[20%]'>{device.brand}</div>
            <div className='w-[10%]'>
              <Link to={`/dashboard/update-device/${device._id}`} className='h-10 w-20 bg-green-500 text-white cursor-pointer'>Edit</Link>
            </div>
            <div className='w-[10%]'>
              <button
                className='h-10 w-20 bg-red-500 text-white cursor-pointer'
                onClick={() => openModal(device._id)}
              >
                Delete
              </button>
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
    </div>
  );
};

export default AllDeviceList;
