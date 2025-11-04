/**
 * Toggle Switch Component
 * A styled toggle switch for boolean settings
 */
import React from 'react';

interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Toggle: React.FC<ToggleProps> = ({
  id,
  checked,
  onChange,
  disabled = false,
  label,
  description,
  size = 'md',
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  const sizeClasses = {
    sm: 'toggle-sm',
    md: 'toggle-md',
    lg: 'toggle-lg',
  };

  return (
    <div className={`toggle-wrapper ${disabled ? 'toggle-disabled' : ''}`}>
      <div className="toggle-container">
        <input
          id={id}
          type="checkbox"
          className={`toggle-input ${sizeClasses[size]}`}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
        />
        <label htmlFor={id} className={`toggle-label ${sizeClasses[size]}`}>
          <span className="toggle-slider"></span>
        </label>
      </div>

      {(label || description) && (
        <div className="toggle-text">
          {label && (
            <label htmlFor={id} className="toggle-title">
              {label}
            </label>
          )}
          {description && (
            <span className="toggle-description">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Toggle;
