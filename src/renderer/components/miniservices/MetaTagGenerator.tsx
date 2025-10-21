/**
 * Meta Tag Generator Component
 * Generates and validates SEO meta tags with templates
 */
import React, { useState } from 'react';
import MiniServiceContainer from './MiniServiceContainer';
import Card from '../ui/Card';
import {
  META_TAG_TEMPLATES,
  validateMetaTags,
  generateMetaTagHTML,
  createBasicMetaTags,
} from '../../../analyzers/technical';
import type {
  MetaTagSet,
  MetaTagValidation,
} from '../../../analyzers/technical';

const MetaTagGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [, setTags] = useState<Partial<MetaTagSet>>({});
  const [validation, setValidation] = useState<MetaTagValidation | null>(null);
  const [html, setHtml] = useState('');

  const [basicData, setBasicData] = useState({
    title: '',
    description: '',
    url: '',
    imageUrl: '',
  });

  const handleGenerateBasic = () => {
    const generatedTags = createBasicMetaTags(
      basicData.title,
      basicData.description,
      basicData.url,
      basicData.imageUrl
    );

    setTags(generatedTags);
    validateAndGenerateHTML(generatedTags);
  };

  const validateAndGenerateHTML = (tagsToValidate: Partial<MetaTagSet>) => {
    const validationResult = validateMetaTags(tagsToValidate);
    const htmlOutput = generateMetaTagHTML(tagsToValidate);

    setValidation(validationResult);
    setHtml(htmlOutput);
  };

  const handleTemplateSelect = (templateName: string) => {
    setSelectedTemplate(templateName);
    // Template would need data to be filled - this is a simplified version
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  // Info card for user tips
  const renderInfoCard = () => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">🏷️</div>
        <h3>Why Meta Tags Matter</h3>
        <div className="info-section">
          <h4>📊 SEO & Social Impact</h4>
          <ul>
            <li>
              <strong>Search Appearance:</strong> Meta tags control how your
              page appears in search results.
            </li>
            <li>
              <strong>Click-Through Rate:</strong> Well-written titles and
              descriptions attract more clicks.
            </li>
            <li>
              <strong>Social Sharing:</strong> Open Graph and Twitter tags
              improve how your content looks when shared.
            </li>
            <li>
              <strong>Relevance:</strong> Accurate tags help search engines
              understand your page topic.
            </li>
          </ul>
        </div>
        <div className="info-section">
          <h4>💡 Pro Tips</h4>
          <ul>
            <li>
              Keep titles 30-60 characters and descriptions 120-160 characters.
            </li>
            <li>
              Include primary keywords naturally in both title and description.
            </li>
            <li>Use unique meta tags for every page.</li>
            <li>Preview your tags for mobile and desktop.</li>
            <li>Validate tags for errors and warnings before publishing.</li>
          </ul>
        </div>
      </div>
    </Card>
  );

  // Inputs
  const renderInputs = () => (
    <div className="input-section">
      <h4>Basic Meta Tags</h4>
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          className="form-control"
          placeholder="Your page title (30-60 characters)"
          value={basicData.title}
          onChange={e => setBasicData({ ...basicData, title: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          className="form-control"
          placeholder="Your page description (120-160 characters)"
          value={basicData.description}
          onChange={e =>
            setBasicData({ ...basicData, description: e.target.value })
          }
          rows={3}
        />
      </div>
      <div className="form-group">
        <label>Page URL</label>
        <input
          type="text"
          className="form-control"
          placeholder="https://example.com/page"
          value={basicData.url}
          onChange={e => setBasicData({ ...basicData, url: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Image URL (optional)</label>
        <input
          type="text"
          className="form-control"
          placeholder="https://example.com/image.jpg"
          value={basicData.imageUrl}
          onChange={e =>
            setBasicData({ ...basicData, imageUrl: e.target.value })
          }
        />
      </div>
      <button
        className="btn btn-primary"
        onClick={handleGenerateBasic}
        disabled={!basicData.title || !basicData.description || !basicData.url}
      >
        Generate Meta Tags
      </button>
      {/* Templates section included in input card */}
      <div className="templates-section">
        <h4>Or Choose a Template</h4>
        <div className="template-grid">
          {META_TAG_TEMPLATES.map(template => (
            <button
              key={template.name}
              className={`template-card ${selectedTemplate === template.name ? 'selected' : ''}`}
              onClick={() => handleTemplateSelect(template.name)}
            >
              <div className="template-name">{template.name}</div>
              <div className="template-category">{template.category}</div>
              <div className="template-description">{template.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ...existing code...

  // Results
  const renderResults = () =>
    validation && (
      <div className="results-section">
        <div className="score-card">
          <div className={`score-badge ${getScoreColor(validation.score)}`}>
            <div className="score-value">{validation.score}</div>
            <div className="score-label">Quality Score</div>
          </div>
          <div className="validation-status">
            <span
              className={validation.isValid ? 'text-success' : 'text-danger'}
            >
              {validation.isValid ? '✓ Valid' : '✗ Has Issues'}
            </span>
          </div>
        </div>
        {validation.errors.length > 0 && (
          <Card className="errors-card">
            <h4>Errors ({validation.errors.length})</h4>
            {validation.errors.map((error, idx) => (
              <div key={idx} className="error-item">
                <span className="badge badge-danger">{error.impact}</span>
                <strong>{error.field}:</strong> {error.message}
              </div>
            ))}
          </Card>
        )}
        {validation.warnings.length > 0 && (
          <Card className="warnings-card">
            <h4>Warnings ({validation.warnings.length})</h4>
            {validation.warnings.map((warning, idx) => (
              <div key={idx} className="warning-item">
                <strong>{warning.field}:</strong> {warning.message}
                <div className="suggestion">{warning.suggestion}</div>
              </div>
            ))}
          </Card>
        )}
        <div className="html-output">
          <h4>Generated HTML</h4>
          <pre className="code-block">
            <code>{html}</code>
          </pre>
          <button
            className="btn btn-secondary"
            onClick={() => navigator.clipboard.writeText(html)}
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    );

  return (
    <MiniServiceContainer
      title="🏷️ Meta Tag Generator"
      description="Generate and validate SEO-optimized meta tags with templates."
      onAnalyze={handleGenerateBasic}
      onClear={() => setValidation(null)}
      loading={false}
      error={null}
      results={validation}
      analyzeButtonText="Generate Meta Tags"
      analyzeButtonDisabled={
        !basicData.title || !basicData.description || !basicData.url
      }
      inputCardTitle="Meta Tag Inputs"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default MetaTagGenerator;
