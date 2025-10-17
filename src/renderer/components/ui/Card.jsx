/**
 * Card Component
 * Reusable card container for content sections
 */
import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  title,
  subtitle,
  children,
  footer,
  className = '',
  headerAction,
}) => {
  const classes = ['card', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {(title || headerAction) && (
        <div className="card-header">
          <div className="card-header-content">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && (
            <div className="card-header-action">{headerAction}</div>
          )}
        </div>
      )}

      <div className="card-body">{children}</div>

      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  className: PropTypes.string,
  headerAction: PropTypes.node,
};

export default Card;
