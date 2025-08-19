import React from 'react';

const Select = ({ label, error, children, className = '', ...props }) => {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <select className={`select ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;


