/**
 * AnalysisConfig Component
 * Configuration options for SEO analysis
 * Features:
 * - Language selection
 * - Content type detection/selection
 * - Analysis focus areas
 * - Advanced options
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Badge from '../ui/Badge';

const AnalysisConfig = ({ config, onChange, content = '' }) => {
  const [detectedType, setDetectedType] = useState(null);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'el', label: 'Greek (Ελληνικά)', flag: '🇬🇷' },
  ];

  const contentTypes = [
    {
      value: 'article',
      label: 'Article / Blog Post',
      icon: '📰',
      description: 'News articles, blog posts, editorial content',
    },
    {
      value: 'product',
      label: 'Product Page',
      icon: '🛍️',
      description: 'E-commerce product descriptions',
    },
    {
      value: 'landing',
      label: 'Landing Page',
      icon: '🎯',
      description: 'Marketing landing pages, service pages',
    },
    {
      value: 'homepage',
      label: 'Homepage',
      icon: '🏠',
      description: 'Website home pages',
    },
  ];

  useEffect(() => {
    if (content && content.length > 100) {
      const detected = detectContentType(content);
      setDetectedType(detected);
    }
  }, [content]);

  const detectContentType = text => {
    const lower = text.toLowerCase();

    // Product page indicators
    if (
      (lower.includes('price') && lower.includes('buy')) ||
      lower.includes('add to cart') ||
      lower.includes('product')
    ) {
      return 'product';
    }

    // Article indicators
    if (
      lower.includes('published') ||
      lower.includes('author') ||
      lower.includes('posted on') ||
      text.split(/\n\n/).length > 5 // Multiple paragraphs
    ) {
      return 'article';
    }

    // Landing page indicators
    if (
      lower.includes('sign up') ||
      lower.includes('get started') ||
      lower.includes('free trial') ||
      lower.includes('contact us')
    ) {
      return 'landing';
    }

    return null;
  };

  const handleChange = (field, value) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="analysis-config">
      {/* Language Selection */}
      <div className="config-section">
        <label className="config-label">🌐 Content Language</label>
        <div className="language-selector">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`language-option ${config.language === lang.code ? 'active' : ''}`}
              onClick={() => handleChange('language', lang.code)}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-label">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Type */}
      <div className="config-section">
        <label className="config-label">
          📄 Content Type
          {detectedType && (
            <Badge variant="info" size="small">
              Auto-detected:{' '}
              {contentTypes.find(t => t.value === detectedType)?.label}
            </Badge>
          )}
        </label>
        <div className="content-type-grid">
          {contentTypes.map(type => (
            <button
              key={type.value}
              className={`type-option ${config.contentType === type.value ? 'active' : ''}`}
              onClick={() => handleChange('contentType', type.value)}
            >
              <span className="type-icon">{type.icon}</span>
              <div className="type-info">
                <div className="type-label">{type.label}</div>
                <div className="type-desc">{type.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="config-summary">
        <p className="summary-text">
          <strong>Configuration:</strong>{' '}
          {config.language?.toUpperCase() || 'EN'} •{' '}
          {contentTypes.find(t => t.value === config.contentType)?.label ||
            'Not set'}
        </p>
      </div>
    </div>
  );
};

AnalysisConfig.propTypes = {
  config: PropTypes.shape({
    language: PropTypes.string,
    contentType: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  content: PropTypes.string,
};

export default AnalysisConfig;
