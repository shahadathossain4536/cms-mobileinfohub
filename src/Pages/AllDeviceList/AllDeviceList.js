import React, { useEffect, useState } from 'react';
import axiosInstance from '../../helpers/axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loading from '../../component/ui/Loading';
import ErrorState from '../../component/ui/ErrorState';
import EmptyState from '../../component/ui/EmptyState';
import Card, { CardHeader, CardContent } from '../../component/ui/Card';
import Button from '../../component/ui/Button';
import Badge from '../../component/ui/Badge';
import Modal from '../../component/ui/Modal';
import Table, { THead, TBody, TR, TH, TD } from '../../component/ui/Table';
import { useDevices, useDeleteDevice } from '../../helpers/queries/deviceQueries';

const AllDeviceList = () => {
  const [brandFilter, setBrandFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const { data: devicesResponse, isLoading, isError, refetch } = useDevices({ page: currentPage, limit: itemsPerPage, brand: brandFilter || undefined });
  const devicesData = devicesResponse?.data || [];
  const serverPagination = devicesResponse?.pagination;
  const deleteDeviceMutation = useDeleteDevice();
  const allDeviceData = devicesData || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHidden, setShowHidden] = useState(true);
  const [brandOptions, setBrandOptions] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);

  // Filter devices based on search term and visibility
  const filteredDevices = allDeviceData.filter(device => {
    const matchesSearch = device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVisibility = showHidden || device.webVisibility !== false;
    
    return matchesSearch && matchesVisibility;
  });

  useEffect(() => {
    if (serverPagination?.totalPages != null) {
      setTotalPages(serverPagination.totalPages);
    } else if (filteredDevices?.length != null) {
      setTotalPages(Math.ceil(filteredDevices.length / itemsPerPage));
    }
  }, [serverPagination, filteredDevices, itemsPerPage]);

  // Fetch brand list (limit 100) for dropdown filter
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true);
        const res = await axiosInstance.get('/brandName?limit=100');
        const data = res.data;
        let brands = [];
        if (data && Array.isArray(data.brandNames)) {
          brands = data.brandNames.map((b) => b.name);
        } else if (Array.isArray(data)) {
          brands = data.map((b) => b.name || b);
        }
        // de-duplicate and sort
        const uniqueSorted = Array.from(new Set(brands.filter(Boolean))).sort((a, b) => a.localeCompare(b));
        setBrandOptions(uniqueSorted);
      } catch (e) {
        setBrandOptions([]);
      } finally {
        setBrandsLoading(false);
      }
    };
    fetchBrands();
  }, []);

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
      await deleteDeviceMutation.mutateAsync(deleteId);
      refetch();
      closeModal();
      toast.success('Device deleted successfully');
    } catch (error) {
      console.error('Error deleting device:', error.message);
      toast.error('Failed to delete device. Please try again.');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedDevices.length === 0) return;
    
    try {
      await Promise.all(selectedDevices.map(id => deleteDeviceMutation.mutateAsync(id)));
      refetch();
      setSelectedDevices([]);
      toast.success(`${selectedDevices.length} devices deleted successfully`);
    } catch (error) {
      console.error('Error deleting selected devices:', error.message);
      toast.error('Failed to delete selected devices. Please try again.');
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDevices;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
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

  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className='flex items-center justify-between mt-6'>
        <div className='text-sm text-slate-600 dark:text-slate-400'>
          Page {serverPagination?.page || currentPage} of {serverPagination?.totalPages || totalPages} — {serverPagination?.total || filteredDevices.length} results
        </div>
        
        <div className='flex items-center gap-2'>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {pageNumbers.map((number) => (
            <Button
              key={number}
              variant={currentPage === number ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(number)}
            >
              {number}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) return <Loading label="Loading devices..." />;
  if (isError) return <ErrorState title="Failed to load devices" onRetry={refetch} />;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>All Devices</h1>
          <p className='text-slate-600 dark:text-slate-400'>Manage your device inventory</p>
        </div>
        <div className='flex items-center gap-3'>
          <Link to="/dashboard/add-device">
            <Button>Add Device</Button>
          </Link>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <svg className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm w-64"
                />
              </div>
              
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <select
                value={brandFilter}
                onChange={(e) => { setBrandFilter(e.target.value); setCurrentPage(1); }}
                className="ml-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              >
                <option value="">All brands</option>
                {brandsLoading ? (
                  <option>Loading...</option>
                ) : (
                  brandOptions.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))
                )}
              </select>
              
              <label className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
                <input
                  type="checkbox"
                  checked={showHidden}
                  onChange={(e) => setShowHidden(e.target.checked)}
                  className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20"
                />
                Show hidden devices
              </label>
            </div>

            {selectedDevices.length > 0 && (
              <div className='flex items-center gap-3'>
                <span className='text-sm text-slate-600 dark:text-slate-400'>
                  {selectedDevices.length} selected
                </span>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={handleDeleteSelected}
                  loading={deleteDeviceMutation.isLoading}
                >
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {filteredDevices.length === 0 ? (
        <EmptyState
          title="No devices found"
          message={searchTerm ? "No devices match your search criteria." : "Get started by adding your first device."}
          actionLabel={!searchTerm ? "Add Device" : undefined}
          onAction={!searchTerm ? () => window.location.href = '/dashboard/add-device' : undefined}
        />
      ) : (
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>
                  <input
                    type="checkbox"
                    checked={selectedDevices.length === currentItems.length && currentItems.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20"
                  />
                </TH>
                <TH>Device</TH>
                <TH>Brand</TH>
                <TH>Status</TH>
                <TH>Specs</TH>
                <TH>Release Date</TH>
                <TH>Actions</TH>
              </TR>
            </THead>
            <TBody>
              {currentItems.map((device) => (
                <TR key={device._id}>
                  <TD>
                    <input
                      type="checkbox"
                      checked={selectedDevices.includes(device._id)}
                      onChange={() => handleSelectDevice(device._id)}
                      className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20"
                    />
                  </TD>
                  <TD>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center'>
                        {device.banner_img ? (
                          <img 
                            src={device.banner_img} 
                            alt={device.deviceName}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className='font-medium text-slate-900 dark:text-white'>{device.deviceName}</div>
                        <div className='text-sm text-slate-500 dark:text-slate-400'>{device.processor}</div>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <span className='font-medium text-slate-900 dark:text-white'>{device.brand}</span>
                  </TD>
                  <TD>
                    <div className='flex items-center gap-2'>
                      <Badge 
                        variant={device.status === 'Available' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {device.status}
                      </Badge>
                      {device.webVisibility === false && (
                        <Badge variant="danger" size="sm">
                          Hidden
                        </Badge>
                      )}
                    </div>
                  </TD>
                  <TD>
                    <div className='text-sm'>
                      <div className='text-slate-900 dark:text-white'>{device.ram} RAM</div>
                      <div className='text-slate-500 dark:text-slate-400'>{device.storage} Storage</div>
                    </div>
                  </TD>
                  <TD>
                    <span className='text-sm text-slate-600 dark:text-slate-400'>{device.release_date}</span>
                  </TD>
                  <TD>
                    <div className='flex items-center gap-2'>
                      <Link to={`/dashboard/update-device/${device._id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => openModal(device._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          
          {totalPages > 1 && renderPagination()}
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Delete Device"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleConfirmDelete}
              loading={deleteDeviceMutation.isLoading}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className='text-slate-600 dark:text-slate-400'>
          Are you sure you want to delete this device? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default AllDeviceList;