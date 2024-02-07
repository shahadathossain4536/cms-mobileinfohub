import logo from './logo.svg';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Login from './Pages/Login/Login';
import Registration from './Pages/Registration/Registration';
import Dashboard from './Pages/Dashboard/Dashboard';
import DashboardHome from './Pages/DashboardHome/DashboardHome';
import AddDevices from './Pages/AddDevices/AddDevices';
import AddBrandName from './Pages/AddBrandName/AddBrandName';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="dashboard" element={<Dashboard />} >
        <Route index element={<DashboardHome />} />
        <Route path='add-brand-name' element={<AddBrandName />} />
        <Route path='add-device' element={<AddDevices />} />

      </Route>


    </Routes>
  );
}

export default App;
