import React from 'react';
import Card, { CardContent } from '../../component/ui/Card';
import { ListSkeleton } from '../../component/ui/Skeleton';
import { useBrands } from '../../helpers/queries/brandQueries';
import { useDevices } from '../../helpers/queries/deviceQueries';

const DashboardHome = () => {
  const { data: brands, isLoading: loadingBrands } = useBrands();
  const { data: devices, isLoading: loadingDevices } = useDevices();

  if (loadingBrands || loadingDevices) {
    return <ListSkeleton rows={4} />;
  }

  const totalBrands = brands?.length || 0;
  const totalDevices = devices?.length || 0;
  const recentDevices = devices?.slice(0, 5) || [];

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
      <Card>
        <CardContent>
          <p className='text-sm text-slate-500'>Total Brands</p>
          <p className='text-3xl font-bold'>{totalBrands}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <p className='text-sm text-slate-500'>Total Devices</p>
          <p className='text-3xl font-bold'>{totalDevices}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <p className='text-sm text-slate-500'>New Devices</p>
          <p className='text-3xl font-bold'>{recentDevices.length}</p>
        </CardContent>
      </Card>

      <Card className='lg:col-span-3'>
        <CardContent>
          <p className='text-lg font-semibold mb-3'>Recent Devices</p>
          <div className='space-y-2'>
            {recentDevices.map((d) => (
              <div key={d._id} className='flex items-center justify-between border-b last:border-b-0 py-2 border-slate-200 dark:border-slate-700'>
                <div className='flex items-center gap-3'>
                  <img src={d.banner_img} alt='' className='w-10 h-10 object-contain' />
                  <div>
                    <p className='font-medium'>{d.deviceName}</p>
                    <p className='text-sm text-slate-500'>{d.brand}</p>
                  </div>
                </div>
                <div className='text-sm text-slate-500'>RAM {d.ram} / {d.storage} GB</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;