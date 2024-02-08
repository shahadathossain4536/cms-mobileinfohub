import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { signup } from '../../redux/actions/user.actions';
const Registration = () => {
    const [selectedOption, setSelectedOption] = useState(null);
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  // console.log("object", selectedOption);
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const user = useSelector((state) => state.user);
  const options = [
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'shopkeeper', label: 'Shopkeeper' },
  ];

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const onSubmit = async (data) => {

    // reset();
  // dispatch(signup(user));

    // const user = {
    //   role : selectedOption?.value,
    //   ...data
    // }
    console.log(data);

    dispatch(signup(data));
  };


  return (
     <div className='flex justify-center items-center  h-[600px]'>
      <div className='max-w-[650px] w-full mx-auto my-auto'>
        <h2 className='text-center text-2xl '>Registration</h2>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col justify-center items-center'>
          <Select
            className="basic-single max-w-[600px] w-full border-2 border-gray-500 rounded-lg block outline-none text-xl my-4"
            classNamePrefix="select"
            onChange={setSelectedOption}
            isDisabled={isDisabled}
            isLoading={isLoading}
            isClearable={isClearable}
            isRtl={isRtl}
            isSearchable={isSearchable}
            name="color"
            options={options}


          />
          {/* {
            selectedOption?.value && 'shopkeeper' && <div className='max-w-[600px] w-full'>
            <input className='max-w-[600px] w-full h-14 border-2 border-gray-500 rounded-lg block outline-none px-4 text-xl my-4' type="text" placeholder='Shop Name'
              {...register("shopName", {
                required: {
                  value: true,
                  message: "Enter Your Shop Name",
                },

              })}
            />
            <label class="label">
              {errors.email?.type === "required" && (
                <span class="label-text-alt text-red-600">
                  {errors?.email?.message}
                </span>
              )}
              {errors.email?.type === "pattern" && (
                <span class="label-text-alt text-red-600">
                  {errors?.email?.message}
                </span>
              )}
            </label>
          </div>
        } */}

          <div className='max-w-[600px] w-full'>
            <input className='max-w-[600px] w-full h-14 border-2 border-gray-500 rounded-lg block outline-none px-4 text-xl my-4' type="text" placeholder='FirstName'
              {...register("firstName", {
                required: {
                  value: true,
                  message: "Enter Your firstName",
                },

              })}
            />
            <label class="label">
              {errors.firstName?.type === "required" && (
                <span class="label-text-alt text-red-600">
                  {errors?.firstName?.message}
                </span>
              )}

            </label>
          </div>
          <div className='max-w-[600px] w-full'>
            <input className='max-w-[600px] w-full h-14 border-2 border-gray-500 rounded-lg block outline-none px-4 text-xl my-4' type="text" placeholder='LastName'
              {...register("lastName", {
                required: {
                  value: true,
                  message: "Enter Your lastName",
                },

              })}
            />
            <label class="label">
              {errors.lastName?.type === "required" && (
                <span class="label-text-alt text-red-600">
                  {errors?.lastName?.message}
                </span>
              )}

            </label>
          </div>
          <div className='max-w-[600px] w-full'>
            <input className='max-w-[600px] w-full h-14 border-2 border-gray-500 rounded-lg block outline-none px-4 text-xl my-4' type="text" placeholder='Email'
              {...register("email", {
                required: {
                  value: true,
                  message: "Enter Your Email",
                },
                pattern: {
                  value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                  message: "Enter a valid email",
                },
              })}
            />
            <label class="label">
              {errors.email?.type === "required" && (
                <span class="label-text-alt text-red-600">
                  {errors?.email?.message}
                </span>
              )}
              {errors.email?.type === "pattern" && (
                <span class="label-text-alt text-red-600">
                  {errors?.email?.message}
                </span>
              )}
            </label>
          </div>
          <div className='max-w-[600px] w-full'>
            <input className='max-w-[600px] w-full h-14 border-2 border-gray-500 rounded-lg block outline-none px-4 text-xl my-4' type="password" placeholder='Password'
              {...register("password", {
                required: {
                  value: true,
                  message: "Enter Your Password",
                },
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    "Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character",
                },
              })} />
            <label class="label">
              {errors.password?.type === "required" && (
                <span class="label-text-alt text-red-600">
                  {errors?.password?.message}
                </span>
              )}
              {errors.password?.type === "pattern" && (
                <span class="label-text-alt text-red-600">
                  {errors?.password?.message}
                </span>
              )}
            </label>
          </div>

          <input className='max-w-[600px] w-full h-14 bg-slate-500 rounded-lg block outline-none text-white px-4 text-xl my-4 cursor-pointer' type="submit" value="Registration" />
        </form>
      </div>
    </div>
  );
};

export default Registration;