/**
 * 🎚️ RangeSlider Component - Professional Range Input
 * קומפוננטת סליידר מקצועית עם עיצוב מותאם
 */

import React from 'react';

const RangeSlider = ({
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  showValue = true,
  unit = '',
  disabled = false,
  className = ''
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  return (
    <div className={`range-slider ${className}`}>
      {/* Label and Value */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm text-gray-600 font-medium">
              {value}{unit}
            </span>
          )}
        </div>
      )}

      {/* Range Input Container */}
      <div className="relative">
        {/* Track Background */}
        <div className="w-full h-2 bg-gray-200 rounded-full relative">
          {/* Progress Fill */}
          <div 
            className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full transition-all duration-150 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {/* Thumb */}
        <div 
          className={`absolute top-1/2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md transform -translate-y-1/2 -translate-x-1/2 transition-all duration-150 ease-out ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
          }`}
          style={{ left: `${percentage}%` }}
        />
      </div>

      {/* Min/Max Labels */}
      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

export default RangeSlider;
