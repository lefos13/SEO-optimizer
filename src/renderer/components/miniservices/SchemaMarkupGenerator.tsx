/**
 * Schema Markup Generator Component
 * Generates structured data (JSON-LD) for common schema types
 */
import React, { useState } from 'react';
import MiniServiceContainer from './MiniServiceContainer';
import Card from '../ui/Card';
import {
  SCHEMA_TEMPLATES,
  generateSchema,
  validateSchema,
  schemaToHTML,
} from '../../../analyzers/technical';
import type {
  SchemaType,
  SchemaMarkup,
  SchemaValidation,
} from '../../../analyzers/technical';

const SchemaMarkupGenerator: React.FC = () => {
  const [selectedType, setSelectedType] = useState<SchemaType | ''>('');
  const [schemaData, setSchemaData] = useState<Record<string, unknown>>({});
  const [generatedSchema, setGeneratedSchema] = useState<SchemaMarkup | null>(
    null
  );
  const [validation, setValidation] = useState<SchemaValidation | null>(null);
  const [html, setHtml] = useState('');
  const selectedTemplate = SCHEMA_TEMPLATES.find(t => t.type === selectedType);

  const handleGenerate = () => {
    if (!selectedType) return;
    try {
      const schema = generateSchema(selectedType as SchemaType, schemaData);
      const validationResult = validateSchema(
        schema,
        selectedType as SchemaType
      );
      const htmlOutput = schemaToHTML(schema);
      setGeneratedSchema(schema);
      setValidation(validationResult);
      setHtml(htmlOutput);
    } catch (error) {
      console.error('Schema generation error:', error);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setSchemaData({ ...schemaData, [field]: value });
  };

  // Info card for user tips
  const renderInfoCard = () => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">📋</div>
        <h3>Why Schema Markup Matters</h3>
        <div className="info-section">
          <h4>📊 SEO & Rich Results</h4>
          <ul>
            <li>
              <strong>Rich Snippets:</strong> Schema markup enables enhanced
              search results with ratings, FAQs, and more.
            </li>
            <li>
              <strong>Click-Through Rate:</strong> Rich results attract more
              attention and clicks.
            </li>
            <li>
              <strong>Content Understanding:</strong> Helps search engines
              understand your page type and content.
            </li>
            <li>
              <strong>Voice Search:</strong> Structured data improves voice
              search results.
            </li>
          </ul>
        </div>
        <div className="info-section">
          <h4>💡 Pro Tips</h4>
          <ul>
            <li>Use the most specific schema type for your content.</li>
            <li>
              Fill all required fields and as many optional fields as possible.
            </li>
            <li>Validate your markup for errors and warnings.</li>
            <li>Test your schema with Google&apos;s Rich Results Test.</li>
            <li>Keep your schema up to date as your content changes.</li>
          </ul>
        </div>
      </div>
    </Card>
  );

  // Inputs
  const renderInputs = () => (
    <div className="input-section">
      <div className="form-group">
        <label>Select Schema Type</label>
        <select
          className="form-control"
          value={selectedType}
          onChange={e => setSelectedType(e.target.value as SchemaType)}
        >
          <option value="">Choose a schema type...</option>
          {SCHEMA_TEMPLATES.map(template => (
            <option key={template.type} value={template.type}>
              {template.name} - {template.description}
            </option>
          ))}
        </select>
      </div>
      {selectedTemplate && (
        <div className="schema-fields">
          <h4>Required Fields</h4>
          {selectedTemplate.requiredFields.map(field => (
            <div key={field} className="form-group">
              <label>
                {field} <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={(schemaData[field] as string) || ''}
                onChange={e => handleFieldChange(field, e.target.value)}
                placeholder={`Enter ${field}`}
              />
            </div>
          ))}
          <h4>Optional Fields</h4>
          {selectedTemplate.optionalFields.map(field => (
            <div key={field} className="form-group">
              <label>{field}</label>
              <input
                type="text"
                className="form-control"
                value={(schemaData[field] as string) || ''}
                onChange={e => handleFieldChange(field, e.target.value)}
                placeholder={`Enter ${field} (optional)`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Results
  const renderResults = () =>
    generatedSchema &&
    validation && (
      <div className="results-section">
        <Card className="validation-card">
          <h4>Validation</h4>
          <div className={`status ${validation.isValid ? 'success' : 'error'}`}>
            {validation.isValid ? '✓ Valid Schema' : '✗ Has Issues'}
          </div>
          <div className="score">Score: {validation.score}/100</div>
          {validation.errors.length > 0 && (
            <div className="errors">
              <h5>Errors:</h5>
              {validation.errors.map((error: string, idx: number) => (
                <div key={idx} className="error-item">
                  {error}
                </div>
              ))}
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div className="warnings">
              <h5>Warnings:</h5>
              {validation.warnings.map((warning: string, idx: number) => (
                <div key={idx} className="warning-item">
                  {warning}
                </div>
              ))}
            </div>
          )}
        </Card>
        <div className="schema-output">
          <h4>Generated JSON-LD</h4>
          <pre className="code-block">
            <code>{JSON.stringify(generatedSchema, null, 2)}</code>
          </pre>
        </div>
        <div className="html-output">
          <h4>HTML Script Tag</h4>
          <pre className="code-block">
            <code>{html}</code>
          </pre>
          <button
            className="btn btn-secondary"
            onClick={() => navigator.clipboard.writeText(html)}
          >
            Copy HTML
          </button>
        </div>
      </div>
    );

  return (
    <MiniServiceContainer
      title="📋 Schema Markup Generator"
      description="Generate structured data (JSON-LD) for common schema types."
      onAnalyze={handleGenerate}
      onClear={() => setGeneratedSchema(null)}
      loading={false}
      error={null}
      results={generatedSchema}
      analyzeButtonText="Generate Schema"
      analyzeButtonDisabled={!selectedType}
      inputCardTitle="Schema Markup Inputs"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};
export default SchemaMarkupGenerator;
