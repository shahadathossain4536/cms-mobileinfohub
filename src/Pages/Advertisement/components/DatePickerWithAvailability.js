import React, { useState, useEffect } from 'react';
import axios from '../../../helpers/axios';
import { getPositionFromCategory } from '../utils/advertisementUtils';

const DatePickerWithAvailability = ({ 
  placement, 
  selectedDate, 
  onDateSelect,
  minDate = new Date()
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateAvailability, setDateAvailability] = useState({});
  const [loading, setLoading] = useState(false);

  // Get API URL
  const getApiUrl = () => {
    return process.env.NODE_ENV === 'development' 
      ? 'http://localhost:2000/api' 
      : 'https://deviceinfohub-server.vercel.app/api';
  };

  useEffect(() => {
    fetchMonthAvailability();
  }, [currentMonth, placement]);

  const fetchMonthAvailability = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const apiUrl = getApiUrl();
      const response = await axios.get(
        `${apiUrl}/advertisement-slots/availability/date-range`,
        {
          params: {
            category: placement,
            position: getPositionFromCategory(placement),
            startDate: startOfMonth.toISOString().split('T')[0],
            endDate: endOfMonth.toISOString().split('T')[0]
          }
        }
      );

      if (response.data.success) {
        const availabilityMap = {};
        response.data.data.availability.forEach(day => {
          availabilityMap[day.date] = day;
        });
        setDateAvailability(availabilityMap);
      }
    } catch (error) {
      console.error('Error fetching date availability:', error);
      // If API fails, allow all dates
      setDateAvailability({});
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

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateAvailable = (date) => {
    const dateKey = formatDateKey(date);
    const availability = dateAvailability[dateKey];
    
    console.log(`📅 Checking availability for ${dateKey}:`, availability);
    
    if (!availability) {
      console.log(`✅ No data for ${dateKey}, assuming available`);
      return true; // If no data, assume available
    }
    
    console.log(`${availability.isAvailable ? '✅' : '❌'} ${dateKey} isAvailable:`, availability.isAvailable);
    return availability.isAvailable;
  };

  const isDateDisabled = (date) => {
    // Check if date is in the past (before today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    console.log(`🗓️ Comparing dates - Check: ${checkDate.toDateString()}, Today: ${today.toDateString()}`);
    
    if (checkDate < today) {
      console.log(`❌ Date ${formatDateKey(date)} is in the past`);
      return true;
    }

    // Check if date is before minDate
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (checkDate < min) {
        console.log(`❌ Date ${formatDateKey(date)} is before minDate`);
        return true;
      }
    }

    // Check if fully booked
    const available = isDateAvailable(date);
    if (!available) {
      console.log(`❌ Date ${formatDateKey(date)} is fully booked`);
    } else {
      console.log(`✅ Date ${formatDateKey(date)} is available`);
    }
    
    return !available;
  };

  const getDateClassName = (date) => {
    const dateKey = formatDateKey(date);
    const availability = dateAvailability[dateKey];
    const isSelected = selectedDate && formatDateKey(selectedDate) === dateKey;
    const isDisabled = isDateDisabled(date);
    const isToday = formatDateKey(new Date()) === dateKey;

    let classes = 'w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-all ';

    if (isSelected) {
      classes += 'bg-blue-500 text-white ring-2 ring-blue-300 ';
    } else if (isDisabled) {
      classes += 'bg-gray-100 text-gray-400 cursor-not-allowed line-through ';
    } else if (isToday) {
      classes += 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50 ';
    } else if (availability && !availability.isAvailable) {
      classes += 'bg-red-50 text-red-400 cursor-not-allowed line-through ';
    } else if (availability && availability.slotsRemaining <= 2) {
      classes += 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 ';
    } else {
      classes += 'hover:bg-blue-50 text-gray-700 ';
    }

    return classes;
  };

  const getDateTooltip = (date) => {
    const dateKey = formatDateKey(date);
    const availability = dateAvailability[dateKey];

    if (!availability) return 'Loading...';

    if (availability.isAvailable) {
      return `Available - ${availability.slotsRemaining} slot(s) remaining`;
    } else {
      return `Fully booked - ${availability.currentAds}/${availability.maxAds} slots used`;
    }
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;
    onDateSelect(date);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="date-picker-with-availability">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ←
          </button>
          <div className="text-lg font-semibold">
            {monthNames[month]} {year}
          </div>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            →
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 mb-4 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded mr-1"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded mr-1"></div>
            <span>Limited (1-2 slots)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded mr-1"></div>
            <span>Fully Booked</span>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-2 text-sm text-gray-500">
            Loading availability...
          </div>
        )}

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {[...Array(startingDayOfWeek)].map((_, index) => (
            <div key={`empty-${index}`} className="w-10 h-10"></div>
          ))}

          {/* Days of the month */}
          {[...Array(daysInMonth)].map((_, index) => {
            const day = index + 1;
            const date = new Date(year, month, day);
            const dateKey = formatDateKey(date);
            const availability = dateAvailability[dateKey];

            return (
              <div
                key={day}
                className="relative group"
              >
                <div
                  onClick={() => handleDateClick(date)}
                  className={getDateClassName(date)}
                  title={getDateTooltip(date)}
                >
                  {day}
                </div>

                {/* Tooltip on hover */}
                {availability && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      {availability.isAvailable ? (
                        <span className="text-green-300">
                          ✅ {availability.slotsRemaining} slot(s) available
                        </span>
                      ) : (
                        <span className="text-red-300">
                          ❌ Fully booked ({availability.currentAds}/{availability.maxAds})
                        </span>
                      )}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Date Display */}
        {selectedDate && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-900">
              Selected Date: {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            {dateAvailability[formatDateKey(selectedDate)] && (
              <div className="text-xs text-blue-700 mt-1">
                {dateAvailability[formatDateKey(selectedDate)].slotsRemaining} slot(s) remaining
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatePickerWithAvailability;

