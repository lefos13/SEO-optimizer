/**
 * Mini Service Wrapper Component
 * Generic wrapper for all mini-service tools with consistent layout
 */
import React from 'react';

export interface MiniServiceWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const MiniServiceWrapper: React.FC<MiniServiceWrapperProps> = ({
  title,
  description,
  children,
}) => {
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

export default MiniServiceWrapper;
