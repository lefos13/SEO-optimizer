/**
 * Schema Markup Generator Component
 * Generates structured data (JSON-LD) for common schema types
 */
import React, { useState } from 'react';
import MiniServiceWrapper from './MiniServiceWrapper';
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

  const selectedTemplate = SCHEMA_TEMPLATES.find(t => t.type === selectedType);

  return (
    <MiniServiceWrapper
      title="Schema Markup Generator"
      description="Generate structured data (JSON-LD) for common schema types"
    >
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

        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={!selectedType}
        >
          Generate Schema
        </button>
      </div>

      {generatedSchema && validation && (
        <div className="results-section">
          <div className="validation-card">
            <h4>Validation</h4>
            <div
              className={`status ${validation.isValid ? 'success' : 'error'}`}
            >
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
          </div>

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
      )}
    </MiniServiceWrapper>
  );
};

export default SchemaMarkupGenerator;
