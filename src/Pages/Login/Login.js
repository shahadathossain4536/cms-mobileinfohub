import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../../redux/actions/auth.actions';
import Button from '../../component/ui/Button';
import Input from '../../component/ui/Input';
import Card, { CardContent, CardHeader } from '../../component/ui/Card';
import axios from '../../helpers/axios';

const Login = () => {
  const {
    register,
    formState: { errors, isValid, isDirty },
    handleSubmit,
    watch,
    setValue,
    trigger,
  } = useForm({
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Watch form values for debugging
  const watchedValues = watch();
  
  // Debug logging
  useEffect(() => {
    console.log('Form errors:', errors);
    console.log('Auth state:', auth);
    console.log('Watched form values:', watchedValues);
    console.log('Form is valid:', isValid);
    console.log('Form is dirty:', isDirty);
    console.log('Form errors details:', {
      email: errors.email?.message,
      password: errors.password?.message
    });
  }, [errors, auth, watchedValues, isValid, isDirty]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (auth.authenticate) {
      navigate(from, { replace: true });
    }
  }, [auth.authenticate, navigate, from]);

  const onSubmit = async (data) => {
    console.log('Form submitted with:', data);
    console.log('Dispatching login action...');
    dispatch(login(data));
  };

  // Test API connection
  const testAPI = async () => {
    try {
      console.log('Testing API connection...');
      const response = await axios.get('/admin/test');
      console.log('API test response:', response);
    } catch (error) {
      console.error('API test error:', error);
      console.log('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
    }
  };

  // Test form with sample data
  const testForm = async () => {
    setValue('email', 'test@example.com');
    setValue('password', 'password123');
    console.log('Test data set, triggering validation...');
    
    // Trigger validation after setting values
    await trigger();
    console.log('Validation triggered, form should now be valid');
  };

  // Clear form errors
  const clearErrors = () => {
    setValue('email', '');
    setValue('password', '');
    console.log('Form cleared');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-brand-primary rounded-2xl mb-4'>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>DeviceHub Admin</h1>
          <p className='text-slate-600 dark:text-slate-400 mt-2'>Sign in to your account</p>
        </div>

        <Card className='shadow-xl'>
          <CardContent className='p-6'>
            {/* Debug Info - Remove this in production */}
            <div className='mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'>
              <p className='text-xs text-blue-600 dark:text-blue-400'>
                <strong>Debug:</strong> Form errors: {Object.keys(errors).length}, Auth error: {auth.error || 'none'}, Valid: {isValid ? 'Yes' : 'No'}, Dirty: {isDirty ? 'Yes' : 'No'}
              </p>
              <div className='mt-2 space-x-2'>
                <button 
                  onClick={testAPI}
                  className='text-xs bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded'
                >
                  Test API Connection
                </button>
                <button 
                  onClick={testForm}
                  className='text-xs bg-green-200 hover:bg-green-300 px-2 py-1 rounded'
                >
                  Test Form Data
                </button>
                <button 
                  onClick={clearErrors}
                  className='text-xs bg-red-200 hover:bg-red-300 px-2 py-1 rounded'
                >
                  Clear Form
                </button>
              </div>
            </div>

            {/* Redux Auth Error Message */}
            {auth.error && (
              <div className='mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'>
                <p className='text-sm text-red-600 dark:text-red-400'>
                  <strong>Login Error:</strong> {auth.error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                required
                error={errors.email?.message}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.954 8.959 0 01-4.5 1.207" />
                  </svg>
                }
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                    message: "Please enter a valid email address",
                  },
                })}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                required
                error={errors.password?.message}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                {...register("password", {
                  required: "Password is required",
                })}
              />

              <div className='flex items-center justify-between'>
                <label className='flex items-center'>
                  <input type="checkbox" className='rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20' />
                  <span className='ml-2 text-sm text-slate-600 dark:text-slate-400'>Remember me</span>
                </label>
                <Link to="/forgot-password" className='text-sm text-brand-primary hover:text-brand-secondary'>
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                loading={auth.authenticating}
                disabled={auth.authenticating || !isValid}
              >
                {auth.authenticating ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className='text-center mt-6'>
          <p className='text-slate-600 dark:text-slate-400'>
            Don't have an account?{' '}
            <Link to="/registration" className='text-brand-primary hover:text-brand-secondary font-medium'>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;