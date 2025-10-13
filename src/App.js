import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login/Login';
import Registration from './Pages/Registration/Registration';
import Dashboard from './Pages/Dashboard/Dashboard';
import AddBrandName from './Pages/AddBrandName/AddBrandName';
import AddDevices from './Pages/AddDevices/AddDevices';
import AllDeviceList from './Pages/AllDeviceList/AllDeviceList';
import AllBrandList from './Pages/AllBrandList/AllBrandList';
import UpdateDevice from './Pages/UpdateDevice/UpdateDevice';
import Advertisement from './Pages/Advertisement/Advertisement';
import MyAdvertisements from './Pages/Advertisement/MyAdvertisements';
import AdminAdvertisements from './Pages/Advertisement/AdminAdvertisements';
import Devices from './Pages/Devices/Devices';
import News from './Pages/News/News';
import Blog from './Pages/Blog/Blog';
import MyCreations from './Pages/MyCreations/MyCreations';
import NotFound from './Pages/NotFound';
import ErrorBoundary from './component/ui/ErrorBoundary';
import LoadingOverlay from './component/ui/LoadingOverlay';
import PrivateRoute from './component/HOC/PrivateRoute';
import { Toaster } from 'react-hot-toast';
import AddDevicesTest from './Pages/AddDevicesTest/AddDevicesTest';
import EditBrand from './Pages/EditBrand/EditBrand';

function App() {
  console.log('App component is rendering');
  
  return (
    <ErrorBoundary>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route index element={<Devices />} />
            <Route path="add-device" element={<AddDevices />} />
            <Route path="all-devices-list" element={<AllDeviceList />} />
            <Route path="add-brand-name" element={<AddBrandName />} />
            <Route path="all-brand-list" element={<AllBrandList />} />
            <Route path="update-device/:id" element={<UpdateDevice />} />
            <Route path="edit-brand/:id" element={<EditBrand />} />
            <Route path="advertisement" element={<Advertisement />} />
            <Route path="my-advertisements" element={<MyAdvertisements />} />
            <Route path="admin-advertisements" element={<AdminAdvertisements />} />
            <Route path="news" element={<News />} />
            <Route path="blog" element={<Blog />} />
            <Route path="my-creations" element={<MyCreations />} />
            <Route path="add-devices-test" element={<AddDevicesTest />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </ErrorBoundary>
  );
}

export default App;
