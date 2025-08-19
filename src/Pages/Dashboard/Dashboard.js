import React, { useState } from 'react';
import Navbar from '../../component/Navbar/Navbar';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Button from '../../component/ui/Button';
import Card, { CardContent } from '../../component/ui/Card';

const Dashboard = () => {
  const location = useLocation()
  const pathname = location.pathname
  console.log("location",location);
  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100'>
      <Navbar />
      <div className='w-full flex'>
        <aside className='hidden md:block w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 p-3'>
          <nav className='space-y-2'>
            <Link aria-current={pathname === '/dashboard' ? 'page' : undefined} className={`flex h-10 rounded-md px-3 items-center ${pathname === '/dashboard' ? 'bg-slate-200 dark:bg-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'}`} to='/dashboard'>Home</Link>
            <Link aria-current={pathname === '/dashboard/add-brand-name' ? 'page' : undefined} className={`flex h-10 rounded-md px-3 items-center ${pathname === '/dashboard/add-brand-name' ? 'bg-slate-200 dark:bg-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'}`} to='/dashboard/add-brand-name'>Add Brand</Link>
            <Link aria-current={pathname === '/dashboard/add-device' ? 'page' : undefined} className={`flex h-10 rounded-md px-3 items-center ${pathname === '/dashboard/add-device' ? 'bg-slate-200 dark:bg-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'}`} to='/dashboard/add-device'>Add Device</Link>
            <Link aria-current={(pathname === '/dashboard/all-devices-list' || pathname === '/dashboard/devices') ? 'page' : undefined} className={`flex h-10 rounded-md px-3 items-center ${(pathname === '/dashboard/all-devices-list' || pathname === '/dashboard/devices') ? 'bg-slate-200 dark:bg-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'}`} to='/dashboard/devices'>Devices</Link>
            <Link aria-current={pathname === '/dashboard/all-brand-list' ? 'page' : undefined} className={`flex h-10 rounded-md px-3 items-center ${pathname === '/dashboard/all-brand-list' ? 'bg-slate-200 dark:bg-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'}`} to='/dashboard/all-brand-list'>All Brand List</Link>
            <Link aria-current={pathname === '/dashboard/advertisement' ? 'page' : undefined} className={`flex h-10 rounded-md px-3 items-center ${pathname === '/dashboard/advertisement' ? 'bg-slate-200 dark:bg-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'}`} to='/dashboard/advertisement'>Advertisement</Link>
          </nav>
        </aside>
        <main className='flex-1 p-4'>
          <Card className='mb-4'>
            <CardContent>
              <div className='flex items-center justify-between'>
                <p className='font-semibold'>Dashboard</p>
                <div className='flex gap-2'>
                  <Button variant='secondary' size='sm'>Actions</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Outlet/>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;