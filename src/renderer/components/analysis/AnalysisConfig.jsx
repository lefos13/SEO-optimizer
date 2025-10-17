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

  const focusAreas = [
    { id: 'content', label: 'Content Quality', icon: '📝' },
    { id: 'technical', label: 'Technical SEO', icon: '⚙️' },
    { id: 'readability', label: 'Readability', icon: '📖' },
    { id: 'keywords', label: 'Keyword Optimization', icon: '🔑' },
  ];

  useEffect(() => {
    if (content && content.length > 100) {
      const detected = detectContentType(content);
      setDetectedType(detected);

      // Auto-set if not already set
      if (!config.contentType && detected) {
        handleChange('contentType', detected);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const toggleFocusArea = areaId => {
    const currentFocus = config.focusAreas || focusAreas.map(f => f.id);
    const newFocus = currentFocus.includes(areaId)
      ? currentFocus.filter(id => id !== areaId)
      : [...currentFocus, areaId];

    // Ensure at least one area is selected
    if (newFocus.length === 0) return;

    handleChange('focusAreas', newFocus);
  };

  const currentFocusAreas = config.focusAreas || focusAreas.map(f => f.id);

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

      {/* Analysis Focus Areas */}
      <div className="config-section">
        <label className="config-label">
          🎯 Analysis Focus Areas
          <span className="config-sublabel">
            (Select areas to analyze - min 1)
          </span>
        </label>
        <div className="focus-areas-grid">
          {focusAreas.map(area => {
            const isSelected = currentFocusAreas.includes(area.id);
            return (
              <button
                key={area.id}
                className={`focus-area-option ${isSelected ? 'active' : ''}`}
                onClick={() => toggleFocusArea(area.id)}
              >
                <span className="focus-icon">{area.icon}</span>
                <span className="focus-label">{area.label}</span>
                {isSelected && <span className="focus-check">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Options */}
      <details className="config-advanced">
        <summary className="advanced-summary">⚙️ Advanced Options</summary>
        <div className="advanced-content">
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={config.strictMode || false}
              onChange={e => handleChange('strictMode', e.target.checked)}
            />
            <div className="checkbox-info">
              <span className="checkbox-label">Strict Mode</span>
              <span className="checkbox-desc">
                Apply stricter scoring criteria for professional content
              </span>
            </div>
          </label>

          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={config.includeWarnings || true}
              onChange={e => handleChange('includeWarnings', e.target.checked)}
            />
            <div className="checkbox-info">
              <span className="checkbox-label">Include Warnings</span>
              <span className="checkbox-desc">
                Show minor issues and suggestions alongside errors
              </span>
            </div>
          </label>

          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={config.generateReport || false}
              onChange={e => handleChange('generateReport', e.target.checked)}
            />
            <div className="checkbox-info">
              <span className="checkbox-label">Auto-Generate Report</span>
              <span className="checkbox-desc">
                Automatically create a downloadable report after analysis
              </span>
            </div>
          </label>
        </div>
      </details>

      {/* Configuration Summary */}
      <div className="config-summary">
        <p className="summary-text">
          <strong>Configuration:</strong>{' '}
          {config.language?.toUpperCase() || 'EN'} •{' '}
          {contentTypes.find(t => t.value === config.contentType)?.label ||
            'Not set'}{' '}
          • {currentFocusAreas.length} focus{' '}
          {currentFocusAreas.length === 1 ? 'area' : 'areas'}
        </p>
      </div>
    </div>
  );
};

AnalysisConfig.propTypes = {
  config: PropTypes.shape({
    language: PropTypes.string,
    contentType: PropTypes.string,
    focusAreas: PropTypes.arrayOf(PropTypes.string),
    strictMode: PropTypes.bool,
    includeWarnings: PropTypes.bool,
    generateReport: PropTypes.bool,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  content: PropTypes.string,
};

export default AnalysisConfig;
