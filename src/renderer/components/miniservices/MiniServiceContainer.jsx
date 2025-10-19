/**
 * MiniServiceContainer - Generic wrapper for mini-service components
 *
 * Provides common structure and logic for all mini-services:
 * - State management (loading, error, results)
 * - Input card wrapper
 * - Results container wrapper
 * - Error handling and display
 * - Analyze/Clear button group
 *
 * Usage:
 * <MiniServiceContainer
 *   title="Service Title"
 *   description="Service description"
 *   onAnalyze={handleAnalyze}
 *   loading={loading}
 *   error={error}
 *   results={results}
 *   onClear={handleClear}
 *   analyzeButtonText="Analyze"
 *   renderInputs={() => <YourInputFields />}
 *   renderResults={() => <YourResultsContent />}
 *   renderInfoCard={() => <YourInfoCard />}
 * />
 */
import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import MiniServiceWrapper from './MiniServiceWrapper';

const MiniServiceContainer = ({
  // Service identity
  title,
  description,

  // Analysis control
  onAnalyze,
  onClear,
  loading = false,
  error = null,
  results = null,

  // Button configuration
  analyzeButtonText = 'Analyze',
  analyzeButtonDisabled = false,
  clearButtonText = 'Clear Results',

  // Render props for custom content
  renderInputs,
  renderResults,
  renderInfoCard,

  // Optional input card customization
  inputCardTitle = null,
  inputCardClassName = 'input-card',

  // Optional results container customization
  resultsContainerClassName = 'results-container',
}) => {
  return (
    <MiniServiceWrapper title={title} description={description}>
      {/* Input Card */}
      <Card className={inputCardClassName}>
        {inputCardTitle && <h3>{inputCardTitle}</h3>}

        {/* Custom input fields rendered by the specific service */}
        {renderInputs && renderInputs()}

        {/* Error display */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="button-group">
          <button
            onClick={onAnalyze}
            disabled={loading || analyzeButtonDisabled}
            className="btn btn-primary"
          >
            {loading ? 'Analyzing...' : analyzeButtonText}
          </button>

          {results && onClear && (
            <button onClick={onClear} className="btn btn-secondary">
              {clearButtonText}
            </button>
          )}
        </div>
      </Card>

      {/* Results Container */}
      <div className={resultsContainerClassName}>
        {/* Results content - only shown when results exist */}
        {results && renderResults && renderResults()}

        {/* Info card - only shown when no results and no error */}
        {!results && !error && renderInfoCard && renderInfoCard()}
      </div>
    </MiniServiceWrapper>
  );
};

MiniServiceContainer.propTypes = {
  // Service identity
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,

  // Analysis control
  onAnalyze: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string,
  results: PropTypes.any,

  // Button configuration
  analyzeButtonText: PropTypes.string,
  analyzeButtonDisabled: PropTypes.bool,
  clearButtonText: PropTypes.string,

  // Render props
  renderInputs: PropTypes.func.isRequired,
  renderResults: PropTypes.func,
  renderInfoCard: PropTypes.func,

  // Optional customization
  inputCardTitle: PropTypes.string,
  inputCardClassName: PropTypes.string,
  resultsContainerClassName: PropTypes.string,
};

export default MiniServiceContainer;
