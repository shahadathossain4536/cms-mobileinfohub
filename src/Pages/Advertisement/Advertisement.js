import React, { useState } from 'react';
import AdsTopBanner from './AdsTopBanner';

const Advertisement = () => {
  const [advertisementTab, setAdvertisementTab] = useState('ads_top_banner')

  const advertisementTabData = [
    {
      id: 1,
      title: "Advertisement Top Banner",
      data: "ads_top_banner",
      icon: "fas fa-ad",
      link: "/advertisement",
      active: advertisementTab === 1,
    },
    {
      id: 2,
      title: "Ads Left Side One Banner",
      data: "ads_left_side_one_banner",
      icon: "fas fa-ad",
      link: "/advertisement",
      active: advertisementTab === 2,
    },
    {
      id: 3,
      title: "Ads Left Side Two Banner",
      data: "ads_left_side_two_banner",
      icon: "fas fa-ad",
      link: "/advertisement",
      active: advertisementTab === 3,
    },
    {
      id: 4,
      title: "Ads Web Site OnLoad",
      data: "ads_web_site_on_load",
      icon: "fas fa-ad",
      link: "/advertisement",
      active: advertisementTab === 3,
    },

  ]
  return (
    <div>
      <div className='h-[50px] w-full bg-slate-50 flex justify-center items-center gap-4'>
        {
          advertisementTabData.map((item, index) => {
            return (
              <div
                key={item.id}
                onClick={() => {
                  setAdvertisementTab(item.data)
                }}
                className={`cursor-pointer px-4 h-[50px] flex justify-center items-center ${advertisementTab === item.data && 'bg-black'}`}
              >

                <span className={`ml-2 ${advertisementTab === item.data && 'text-white'}`}>{item.title}</span>
              </div>
            )
          })
        }
      </div>

      <div className='p-5'>
        {
          advertisementTab === 'ads_top_banner' &&

          <div>

              <AdsTopBanner/>
          </div>
        }
      </div>
      <div>
        {
          advertisementTab === 'ads_left_side_one_banner' &&

          <div>

              <h1>ads_left_side_one_banner</h1>
          </div>
        }
      </div>

    </div>
  );
};

export default Advertisement;