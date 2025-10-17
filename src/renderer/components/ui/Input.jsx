/**
 * Input Component
 * Reusable input field with label and help text
 */
import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
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
  fullWidth = false,
  className = '',
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
      />

      {error && <span className="input-error-message">{error}</span>}
      {help && !error && <span className="input-help">{help}</span>}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  name: PropTypes.string,
  id: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  help: PropTypes.string,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
