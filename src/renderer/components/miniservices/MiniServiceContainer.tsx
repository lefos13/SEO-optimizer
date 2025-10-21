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
import Card from '../ui/Card';
import MiniServiceWrapper from './MiniServiceWrapper';

export interface MiniServiceContainerProps<T = unknown> {
  // Service identity
  title: string;
  description: string;

  // Analysis control
  onAnalyze: () => void;
  onClear?: () => void;
  loading?: boolean;
  error?: string | null;
  results?: T | null;

  // Button configuration
  analyzeButtonText?: string;
  analyzeButtonDisabled?: boolean;
  clearButtonText?: string;

  // Render props for custom content
  renderInputs: () => React.ReactNode;
  renderResults?: () => React.ReactNode;
  renderInfoCard?: () => React.ReactNode;

  // Optional input card customization
  inputCardTitle?: string | null;
  inputCardClassName?: string;

  // Optional results container customization
  resultsContainerClassName?: string;

  // Optional: hide action buttons (for services without explicit analyze/clear actions)
  hideActions?: boolean;
}

const MiniServiceContainer = <T = unknown,>({
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
  hideActions = false,
}: MiniServiceContainerProps<T>): React.ReactElement => {
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
        {!hideActions && (
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
        )}
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

export default MiniServiceContainer;
