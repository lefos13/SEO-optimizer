/**
 * Mini Service Wrapper Component
 * Generic wrapper for all mini-service tools with consistent layout
 */
import React from 'react';
import PropTypes from 'prop-types';

const MiniServiceWrapper = ({ title, description, children }) => {
  return (
    <div className="mini-service-content">
      <div className="mini-service-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="mini-service-subcontent">{children}</div>
    </div>
  );
};

MiniServiceWrapper.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default MiniServiceWrapper;
