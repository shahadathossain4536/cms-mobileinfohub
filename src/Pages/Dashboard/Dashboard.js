import React from 'react';
import Navbar from '../../component/Navbar/Navbar';
import { Link, Outlet, useLocation } from 'react-router-dom';

const Dashboard = () => {
  const location = useLocation()
  const pathname = location.pathname
  console.log("location",location);
  return (
    <div>
      <Navbar />
      <div className='w-full flex'>
        <div className='border-r-2 px-2 w-64 h-screen py-2'>
          <Link className={`w-full h-10 ${pathname === '/dashboard' && 'bg-slate-200'}   rounded-md flex justify-center items-center my-2`} to='/dashboard'>Home</Link>
          <Link className={`w-full h-10 ${pathname === '/dashboard/add-brand-name' && 'bg-slate-200'}   rounded-md flex justify-center items-center my-2`} to='/dashboard/add-brand-name'>Add Brand</Link>
          <Link className={`w-full h-10 ${pathname === '/dashboard/add-device' && 'bg-slate-200'}   rounded-md flex justify-center items-center my-2`} to='/dashboard/add-device'>Add Device</Link>
          <Link className={`w-full h-10 ${pathname === '/dashboard/all-devices-list' && 'bg-slate-200'}   rounded-md flex justify-center items-center my-2`} to='/dashboard/all-devices-list'>All Devices List</Link>
          <Link className={`w-full h-10 ${pathname === '/dashboard/all-brand-list' && 'bg-slate-200'}   rounded-md flex justify-center items-center my-2`} to='/dashboard/all-brand-list'>All Brand List</Link>
        </div>
        <div className='w-full py-2 px-4 flex justify-center items-center'>
          <Outlet/>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;