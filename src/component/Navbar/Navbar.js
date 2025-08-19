import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signout } from '../../redux/actions/auth.actions';

const Navbar = () => {
  const dispatch = useDispatch();
  const reduxUser = useSelector(state => state.auth?.user);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Get user data from localStorage as fallback
  const [localUser, setLocalUser] = useState(null);
  
  useEffect(() => {
    // Function to read and parse user data
    const readUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        console.log('Raw localStorage user data:', userData); // Debug log
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('Parsed user data:', parsedUser); // Debug log
          setLocalUser(parsedUser);
        } else {
          console.log('No user data found in localStorage'); // Debug log
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    };

    // Read immediately
    readUserData();
    
    // Also listen for storage changes (in case user data is updated elsewhere)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        readUserData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Use localStorage user data as fallback if Redux doesn't have it
  const user = reduxUser || localUser;
  
  // Debug log to see what user data we have
  console.log('Current user data:', { reduxUser, localUser, finalUser: user });

  const onLogout = () => {
    dispatch(signout());
    setOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get display name
  const getDisplayName = () => {
    if (user?.fullName) {
      return user.fullName;
    } else if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    }
    return 'User';
  };

  // Get user email with fallback
  const getUserEmail = () => {
    if (user?.email) {
      return user.email;
    }
    return 'user@example.com';
  };

  return (
    <nav className='h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6'>
      <div className='flex items-center justify-between h-full'>
        {/* Logo */}
        <div className='flex items-center'>
          <div className='w-32 h-8'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 220 40" className="h-full w-auto">
              <path fill="currentColor" d="M20 40c11.046 0 20-8.954 20-20V6a6 6 0 0 0-6-6H21v8.774c0 2.002.122 4.076 1.172 5.78a9.999 9.999 0 0 0 6.904 4.627l.383.062a.8.8 0 0 1 0 1.514l-.383.062a10 10 0 0 0-8.257 8.257l-.062.383a.8.8 0 0 1-1.514 0l-.062-.383a10 10 0 0 0-4.627-6.904C12.85 21.122 10.776 21 8.774 21H.024C.547 31.581 9.29 40 20 40Z"></path>
              <path fill="currentColor" d="M0 19h8.774c2.002 0 4.076-.122 5.78-1.172a10.018 10.018 0 0 0 3.274-3.274C18.878 12.85 19 10.776 19 8.774V0H6a6 6 0 0 0-6 6v13Z"></path>
              <text x="50" y="28" className="fill-current text-xl font-bold">DeviceHub</text>
            </svg>
          </div>
        </div>

        {/* Search Bar */}
        <div className='flex-1 max-w-md mx-8'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <svg className='h-4 w-4 text-slate-400' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm"
            />
          </div>
        </div>

        {/* Right side */}
        <div className='flex items-center gap-4'>
          {/* Notifications */}
          <button className='p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 relative'>
            <svg className='h-5 w-5 text-slate-600 dark:text-slate-400' fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className='absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full'></span>
          </button>

          {/* Theme Toggle */}
          <button className='p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200'>
            <svg className='h-5 w-5 text-slate-600 dark:text-slate-400' fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          {/* User Menu */}
          <div className='relative' ref={dropdownRef}>
            <button 
              onClick={() => setOpen(!open)} 
              className='flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200'
            >
              <div className='w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center'>
                <span className='text-white text-sm font-medium'>
                  {getUserInitials()}
                </span>
              </div>
              <div className='hidden md:block text-left'>
                <p className='text-sm font-medium text-slate-900 dark:text-white'>
                  {getDisplayName()}
                </p>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  {getUserEmail()}
                </p>
              </div>
              <svg className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {open && (
              <div className='absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-50 animate-slide-in'>
                {/* User Info Header */}
                <div className='px-4 py-4 border-b border-slate-200 dark:border-slate-700'>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center'>
                      <span className='text-white text-lg font-medium'>
                        {getUserInitials()}
                      </span>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-semibold text-slate-900 dark:text-white truncate'>
                        {getDisplayName()}
                      </p>
                      <p className='text-xs text-slate-500 dark:text-slate-400 truncate'>
                        {getUserEmail()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Role Badge */}
                  {user?.role && (
                    <div className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20'>
                      <svg className='w-3 h-3 mr-1' fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                  )}
                </div>
                
                {/* Menu Items */}
                <div className='py-2'>
                  <button className='flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200'>
                    <svg className='h-4 w-4' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </button>
                  
                  <button className='flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200'>
                    <svg className='h-4 w-4' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Preferences
                  </button>
                </div>

                {/* Logout Section */}
                <div className='border-t border-slate-200 dark:border-slate-700 py-2'>
                  <button 
                    onClick={onLogout}
                    className='flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200'
                  >
                    <svg className='h-4 w-4' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;