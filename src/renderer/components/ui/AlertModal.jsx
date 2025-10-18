/**
 * AlertModal Component
 * Custom modal for alerts and confirmations instead of browser alert()
 * Features:
 * - Simple alert messages
 * - Confirmation dialogs
 * - Multiple variants (info, success, warning, danger)
 * - Customizable actions
 */
import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const AlertModal = ({
  isOpen,
  title,
  message,
  variant = 'info',
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  isDangerous = false,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'danger':
        return '✕';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'success':
        return 'alert-success';
      case 'warning':
        return 'alert-warning';
      case 'danger':
        return 'alert-danger';
      case 'info':
      default:
        return 'alert-info';
    }
  };

  return (
    <div className="modal-overlay alert-overlay">
      <div className={`alert-modal ${getVariantClass()}`}>
        <div className="alert-header">
          <div className="alert-icon">{getIcon()}</div>
          <h3 className="alert-title">{title}</h3>
        </div>

        <div className="alert-body">
          <p className="alert-message">{message}</p>
        </div>

        <div className="alert-footer">
          {onConfirm ? (
            <>
              <Button variant="secondary" onClick={onClose}>
                {cancelText}
              </Button>
              <Button
                variant={isDangerous ? 'danger' : 'primary'}
                onClick={onConfirm}
              >
                {confirmText}
              </Button>
            </>
          ) : (
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onClick={onClose}
              fullWidth
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

AlertModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'danger']),
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  isDangerous: PropTypes.bool,
};

export default AlertModal;
