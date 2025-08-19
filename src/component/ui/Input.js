import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <input className={`input ${className}`} {...props} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;


