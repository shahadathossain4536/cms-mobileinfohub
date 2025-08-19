import React, { useState } from 'react';
import Button from '../../component/ui/Button';
import Card, { CardHeader, CardContent } from '../../component/ui/Card';
import Modal from '../../component/ui/Modal';
import AddDevices from '../AddDevices/AddDevices';
import AllDeviceList from '../AllDeviceList/AllDeviceList';

const Devices = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className='w-full'>
      <Card className='mb-4'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Devices</h2>
            <Button onClick={() => setOpen(true)}>Add New Device</Button>
          </div>
        </CardHeader>
        <CardContent>
          <AllDeviceList />
        </CardContent>
      </Card>

      <Modal isOpen={open} onClose={() => setOpen(false)} title='Add New Device' size='full'>
        <AddDevices />
      </Modal>
    </div>
  );
};

export default Devices;


