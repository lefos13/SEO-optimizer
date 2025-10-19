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
import Button from './Button';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  variant?: AlertVariant;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({
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

  const getIcon = (): string => {
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

  const getVariantClass = (): string => {
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

export default AlertModal;
