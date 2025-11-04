/**
 * Select Component
 * A styled select dropdown for settings
 */
import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  id?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  label?: string;
  description?: string;
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  disabled = false,
  fullWidth = false,
  label,
  description,
  error,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    // Try to convert to number if it's a numeric string
    const numericValue = Number(newValue);
    onChange(isNaN(numericValue) ? newValue : numericValue);
  };

  return (
    <div className={`select-wrapper ${fullWidth ? 'select-full-width' : ''}`}>
      {label && (
        <label htmlFor={id} className="select-label">
          {label}
        </label>
      )}

      <div className="select-container">
        <select
          id={id}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`select-input ${error ? 'select-error' : ''}`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <span className="select-arrow">▼</span>
      </div>

      {description && !error && (
        <span className="select-description">{description}</span>
      )}

      {error && <span className="select-error-text">{error}</span>}
    </div>
  );
};

export default Select;
