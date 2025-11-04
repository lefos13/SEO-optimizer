/**
 * Input Component
 * Reusable input field with label and help text
 */
import React from 'react';

export interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  name?: string;
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  help?: string;
  description?: string;
  fullWidth?: boolean;
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  name,
  id,
  disabled = false,
  readOnly = false,
  required = false,
  error,
  help,
  description,
  fullWidth = false,
  className = '',
  min,
  max,
  step,
}) => {
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  const classes = [
    'input',
    error ? 'input-error' : '',
    fullWidth ? 'input-full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`input-wrapper ${fullWidth ? 'full-width' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}

      <input
        type={type}
        id={inputId}
        name={name}
        className={classes}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        min={min}
        max={max}
        step={step}
      />

      {error && <span className="input-error-message">{error}</span>}
      {description && !error && (
        <span className="input-help">{description}</span>
      )}
      {help && !error && !description && (
        <span className="input-help">{help}</span>
      )}
    </div>
  );
};

export default Input;
