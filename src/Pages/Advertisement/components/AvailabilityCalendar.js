import React, { useState, useEffect } from 'react';
import { getPositionFromCategory } from '../utils/advertisementUtils';
import axios from '../../../helpers/axios';
import toast from 'react-hot-toast';

const AvailabilityCalendar = ({ placement, onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);

  const getApiUrl = () => {
    return process.env.NODE_ENV === 'development' 
      ? 'http://localhost:2000/api' 
      : 'https://api.mobileinfohub.com/api';
  };

  useEffect(() => {
    if (placement) {
      fetchMonthAvailability();
    }
  }, [currentMonth, placement]);

  const fetchMonthAvailability = async () => {
    try {
      setLoading(true);
      
      // Get first and last day of current month
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const apiUrl = getApiUrl();
      const response = await axios.get(`${apiUrl}/advertisement-slots/availability/date-range`, {
        params: {
          category: placement,
          position: getPositionFromCategory(placement),
          startDate: firstDay.toISOString().split('T')[0],
          endDate: lastDay.toISOString().split('T')[0]
        }
      });

      if (response.data.success) {
        // Convert array to object for faster lookup
        const availabilityMap = {};
        response.data.data.availability.forEach(item => {
          availabilityMap[item.date] = item;
        });
        setAvailability(availabilityMap);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      // If API fails, assume all dates are available
      setAvailability({});
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateInPast = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getDateAvailability = (day) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString().split('T')[0];
    return availability[dateStr] || { isAvailable: true, slotsRemaining: 1 };
  };

  const handleDateClick = (day) => {
    if (isDateInPast(day)) {
      toast.error('Cannot select past dates');
      return;
    }

    const dateAvail = getDateAvailability(day);
    if (!dateAvail.isAvailable) {
      toast.error(`No slots available on this date (${dateAvail.currentAds}/${dateAvail.maxAds} slots booked)`);
      return;
    }

    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    onDateSelect(dateStr);
  };

  const isSelectedDate = (day) => {
    if (!selectedDate) return false;
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString().split('T')[0];
    return selectedDate === dateStr;
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="availability-calendar bg-white border border-gray-200 rounded-lg p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Start Date</h3>
        {loading && <span className="text-sm text-blue-600">Loading availability...</span>}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <span className="text-lg font-semibold text-gray-900">{monthName}</span>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 mb-4 text-xs">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-1"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-1"></div>
          <span>Limited</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-1"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-1"></div>
          <span>Past</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square"></div>
        ))}

        {/* Calendar days */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const isPast = isDateInPast(day);
          const dateAvail = getDateAvailability(day);
          const isSelected = isSelectedDate(day);
          
          let dayClassName = 'aspect-square flex flex-col items-center justify-center rounded-lg text-sm cursor-pointer transition-colors border ';
          
          if (isPast) {
            dayClassName += 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed';
          } else if (isSelected) {
            dayClassName += 'bg-blue-500 text-white border-blue-600 font-bold';
          } else if (!dateAvail.isAvailable) {
            dayClassName += 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed';
          } else if (dateAvail.slotsRemaining === 1 && dateAvail.maxAds > 1) {
            dayClassName += 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200';
          } else {
            dayClassName += 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100';
          }

          return (
            <div
              key={day}
              onClick={() => !isPast && handleDateClick(day)}
              className={dayClassName}
              title={
                isPast 
                  ? 'Past date' 
                  : !dateAvail.isAvailable 
                    ? `Fully booked (${dateAvail.currentAds}/${dateAvail.maxAds} slots)` 
                    : `${dateAvail.slotsRemaining} slot(s) available`
              }
            >
              <span className="font-medium">{day}</span>
              {!isPast && !loading && (
                <span className="text-xs mt-0.5">
                  {dateAvail.isAvailable 
                    ? dateAvail.slotsRemaining > 0 
                      ? `${dateAvail.slotsRemaining}`
                      : '✓'
                    : '✗'
                  }
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Selected Date</p>
              <p className="text-lg font-bold text-blue-700">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              {availability[selectedDate] && (
                <div className="text-sm text-blue-700">
                  <div>{availability[selectedDate].slotsRemaining} slot(s) available</div>
                  <div className="text-xs">{availability[selectedDate].currentAds}/{availability[selectedDate].maxAds} booked</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-500">
        <p>💡 Tip: Numbers show available slots. Green = Available, Yellow = Limited, Red = Booked</p>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;

