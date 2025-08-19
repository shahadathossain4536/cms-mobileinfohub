import React from 'react';
import Card, { CardContent, CardHeader } from '../../component/ui/Card';
import { ListSkeleton } from '../../component/ui/Skeleton';
import Badge from '../../component/ui/Badge';
import { useBrands } from '../../helpers/queries/brandQueries';
import { useDevices } from '../../helpers/queries/deviceQueries';

const DashboardHome = () => {
  const { data: brands, isLoading: loadingBrands } = useBrands();
  const { data: devices, isLoading: loadingDevices } = useDevices();

  if (loadingBrands || loadingDevices) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='h-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse' />
          ))}
        </div>
        <ListSkeleton rows={5} />
      </div>
    );
  }

  const totalBrands = brands?.length || 0;
  const totalDevices = devices?.length || 0;
  const recentDevices = devices?.slice(0, 8) || [];
  const availableDevices = devices?.filter(d => d.status === 'Available')?.length || 0;
  const comingSoonDevices = devices?.filter(d => d.status === 'Coming soon')?.length || 0;

  const stats = [
    {
      title: 'Total Devices',
      value: totalDevices,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Brands',
      value: totalBrands,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Available',
      value: availableDevices,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Coming Soon',
      value: comingSoonDevices,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      change: '+3%',
      changeType: 'positive'
    },
  ];

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>Dashboard</h1>
        <p className='text-slate-600 dark:text-slate-400 mt-2'>Welcome back! Here's what's happening with your devices.</p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat, index) => (
          <Card key={index} className='hover:shadow-md transition-shadow duration-200'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-slate-600 dark:text-slate-400'>{stat.title}</p>
                  <p className='text-3xl font-bold text-slate-900 dark:text-white mt-2'>{stat.value}</p>
                  <div className='flex items-center mt-2'>
                    <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className='text-sm text-slate-500 dark:text-slate-400 ml-1'>from last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Devices */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-slate-900 dark:text-white'>Recent Devices</h2>
              <p className='text-slate-600 dark:text-slate-400 text-sm mt-1'>Latest devices added to the system</p>
            </div>
            <Badge variant="primary">{recentDevices.length} devices</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {recentDevices.length === 0 ? (
              <div className='text-center py-8'>
                <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className='text-slate-500 dark:text-slate-400'>No devices found</p>
              </div>
            ) : (
              recentDevices.map((device) => (
                <div key={device._id} className='flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center'>
                      {device.banner_img ? (
                        <img 
                          src={device.banner_img} 
                          alt={device.deviceName}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className='font-medium text-slate-900 dark:text-white'>{device.deviceName}</h3>
                      <div className='flex items-center gap-2 mt-1'>
                        <span className='text-sm text-slate-500 dark:text-slate-400'>{device.brand}</span>
                        <span className='text-slate-300 dark:text-slate-600'>•</span>
                        <span className='text-sm text-slate-500 dark:text-slate-400'>
                          {device.ram} RAM / {device.storage} Storage
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Badge 
                      variant={device.status === 'Available' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {device.status}
                    </Badge>
                    <span className='text-sm text-slate-500 dark:text-slate-400'>
                      {device.release_date}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;