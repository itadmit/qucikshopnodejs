/**
 * 🎨 QuickShop - Professional Dropdown Component
 * קומפוננטת דרופ-דאון מקצועית עם תמיכה מלאה ב-RTL
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'בחר אפשרות...',
  disabled = false,
  searchable = false,
  clearable = false,
  multiple = false,
  size = 'md',
  variant = 'default',
  className = '',
  label,
  error,
  required = false,
  maxHeight = '200px',
  position = 'bottom',
  renderOption,
  renderValue,
  onOpen,
  onClose,
  loading = false,
  emptyMessage = 'לא נמצאו תוצאות',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        (option.label || option.value || option)
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : options;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (focusedIndex >= 0) {
            handleSelect(filteredOptions[focusedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          handleClose();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, focusedIndex, filteredOptions]);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex];
      if (focusedElement) {
        focusedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [focusedIndex]);

  const handleToggle = () => {
    if (disabled) return;
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  };

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    setFocusedIndex(-1);
    onOpen?.();
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
    setFocusedIndex(-1);
    onClose?.();
  };

  const handleSelect = (option) => {
    const optionValue = option?.value ?? option;
    
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
      handleClose();
    }
  };

  const handleClear = (event) => {
    event.stopPropagation();
    onChange?.(multiple ? [] : null);
  };

  const getDisplayValue = () => {
    if (renderValue) {
      return renderValue(value);
    }

    if (multiple) {
      const values = Array.isArray(value) ? value : [];
      if (values.length === 0) return placeholder;
      if (values.length === 1) {
        const option = options.find(opt => (opt?.value ?? opt) === values[0]);
        return option?.label ?? option?.value ?? option ?? values[0];
      }
      return `${values.length} נבחרו`;
    }

    if (value == null) return placeholder;
    
    const option = options.find(opt => (opt?.value ?? opt) === value);
    return option?.label ?? option?.value ?? option ?? value;
  };

  const isSelected = (option) => {
    const optionValue = option?.value ?? option;
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  // Variant styles
  const variantClasses = {
    default: 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500',
    filled: 'border-gray-200 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-blue-500',
    outlined: 'border-2 border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500'
  };

  const baseClasses = `
    relative w-full rounded-lg border transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={baseClasses}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 text-right truncate">
            <span className={value == null || (multiple && (!value || value.length === 0)) 
              ? 'text-gray-500' 
              : 'text-gray-900'
            }>
              {getDisplayValue()}
            </span>
          </div>
          
          <div className="flex items-center space-x-1 space-x-reverse mr-2">
            {/* Clear button */}
            {clearable && value != null && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                title="נקה בחירה"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {/* Loading spinner */}
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
            ) : (
              <ChevronDown 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'transform rotate-180' : ''
                }`} 
              />
            )}
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`
          absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
          ${position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}
        `}>
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="חיפוש..."
                  className="w-full pr-10 pl-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div 
            ref={listRef}
            className="py-1 overflow-y-auto"
            style={{ maxHeight }}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = option?.value ?? option;
                const optionLabel = option?.label ?? option?.value ?? option;
                const selected = isSelected(option);
                const focused = index === focusedIndex;

                return (
                  <button
                    key={optionValue}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full px-4 py-2 text-sm text-right flex items-center justify-between
                      transition-colors duration-150 ease-in-out
                      ${focused ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50'}
                      ${selected ? 'bg-blue-50 text-blue-700' : ''}
                    `}
                  >
                    <div className="flex-1 text-right">
                      {renderOption ? renderOption(option, selected) : optionLabel}
                    </div>
                    
                    {selected && (
                      <Check className="w-4 h-4 text-blue-600 mr-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 text-right">{error}</p>
      )}
    </div>
  );
};

export default Dropdown;
