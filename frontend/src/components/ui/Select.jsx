/**
 * 🎨 QuickShop - Simple Select Component
 * קומפוננטת Select פשוטה עם תמיכה ב-RTL
 */

import React from 'react';
import Dropdown from './Dropdown';

const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'בחר אפשרות...',
  disabled = false,
  size = 'md',
  variant = 'default',
  className = '',
  label,
  error,
  required = false,
  ...props
}) => {
  return (
    <Dropdown
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      size={size}
      variant={variant}
      className={className}
      label={label}
      error={error}
      required={required}
      searchable={false}
      clearable={false}
      multiple={false}
      {...props}
    />
  );
};

export default Select;
