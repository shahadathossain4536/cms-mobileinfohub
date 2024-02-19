import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AllDeviceList = () => {
  // State to hold the fetched data
  const [allDeviceData, setAllDeviceData] = useState([]);
  console.log("allDeviceData", allDeviceData);
  useEffect(() => {
    // Function to fetch data
    const fetchData = async () => {
      try {
        // Make a GET request using Axios
        const response = await axios.get('http://localhost:2000/api/devicesData');

        // Set the fetched data to the state
        setAllDeviceData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    // Call the fetch data function
    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once when the component mounts
  const handleDeviceDelete = (id) => {
  console.log("handleDeviceDelete",id);
}
  const handleDeviceEdit = (id) => {
  console.log("handleDeviceEdit",id);
}
  return (
    <div className='w-full'>
      <h2 className='text-center text-2xl font-inter py-5'>All Device List</h2>
      <div className='flex w-full h-12 items-center bg-slate-400 bg-opacity-20 px-4'>
        <div className='w-[10%]'>
          <p>Device Image</p>
        </div>
        <div className='w-[40%]'>
          <p>Name</p>
        </div>
        <div className='w-[20%]'>Brand</div>
        <div className='w-[10%]'>

        </div>
        <div className='w-[10%]'>

        </div>
      </div>

      {/* Render your device data here */}
      <ul>
        {allDeviceData.map((device, index) => (
        <div className='flex w-full h-12 items-center my-3 px-4 border-b-2 pb-2' key={index}>
        <div className='w-[10%]'>
          <img className='w-10 h-10 object-contain' src={device.banner_img} alt="" />
        </div>
        <div className='w-[40%]'>
              <p>{device.deviceName}</p>
        </div>
            <div className='w-[20%]'>{device.brand}</div>
        <div className='w-[10%]'>
          <button className='h-10 w-20 bg-green-500 text-white cursor-pointer' onClick={()=>handleDeviceEdit(device._id)}>Edit</button>
        </div>
        <div className='w-[10%]'>
          <button className='h-10 w-20 bg-red-500 text-white cursor-pointer' onClick={()=>handleDeviceDelete(device._id)}>Delete</button>
        </div>
      </div>
        ))}
      </ul>
    </div>
  );
};

export default AllDeviceList;
