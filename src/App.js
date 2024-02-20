import logo from './logo.svg';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Login from './Pages/Login/Login';
import Registration from './Pages/Registration/Registration';
import Dashboard from './Pages/Dashboard/Dashboard';
import DashboardHome from './Pages/DashboardHome/DashboardHome';
import AddDevices from './Pages/AddDevices/AddDevices';
import AddBrandName from './Pages/AddBrandName/AddBrandName';
import PrivateRoute from './component/HOC/PrivateRoute';
import { Toaster } from 'react-hot-toast';
import AddDevicesTest from './Pages/AddDevicesTest/AddDevicesTest';
import AllDeviceList from './Pages/AllDeviceList/AllDeviceList';
import UpdateDevice from './Pages/UpdateDevice/UpdateDevice';

function App() {
  return (

    <div>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>

      } >
          <Route index element={
            <DashboardHome />
          } />
          <Route path='add-brand-name' element={<AddBrandName />} />
          <Route path='add-device' element={<AddDevices />} />
          <Route path='all-devices-list' element={<AllDeviceList />} />
          <Route path='update-device/:id' element={<UpdateDevice />} />

        </Route>


      </Routes>
    </div>

  );
}

export default App;
