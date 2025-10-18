/**
 * KeywordsInput Component
 * Target keywords management with chip interface
 * Features:
 * - Add/remove keywords as chips
 * - Keyword suggestions
 * - Keyword density preview
 * - Validation
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const KeywordsInput = ({ keywords = [], onChange, content = '' }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [keywordDensities, setKeywordDensities] = useState({});

  useEffect(() => {
    if (content && content.length > 100) {
      console.log('Generate Suggestions!');
      generateSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  useEffect(() => {
    // Update densities when keywords or content changes
    if (keywords.length > 0 && content) {
      updateDensities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywords, content]);

  const updateDensities = async () => {
    if (!content || keywords.length === 0) return;

    try {
      const densities = await window.electronAPI.seo.calculateDensities(
        content,
        keywords
      );

      // Convert array to object for easy lookup
      const densityMap = {};
      densities.forEach(d => {
        densityMap[d.keyword] = d.density.toFixed(2);
      });

      setKeywordDensities(densityMap);
    } catch (error) {
      console.error('Failed to calculate densities:', error);
    }
  };

  const generateSuggestions = async () => {
    if (!content || content.length < 100) {
      setSuggestions([]);
      return;
    }

    try {
      // Call backend keyword suggestion engine
      const suggestions = await window.electronAPI.seo.suggestKeywords(
        content,
        5 // Get top 5 suggestions
      );

      console.log('Suggestions fetched');

      // Extract just the keyword strings and filter out already selected ones
      const suggestionKeywords = suggestions
        .map(s => s.keyword)
        .filter(word => !keywords.includes(word))
        .slice(0, 5);

      setSuggestions(suggestionKeywords);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleAdd = () => {
    const keyword = inputValue.trim().toLowerCase();

    if (!keyword) return;

    if (keywords.includes(keyword)) {
      return; // Already exists
    }

    if (keywords.length >= 10) {
      return; // Max limit
    }

    const newKeywords = [...keywords, keyword];
    onChange(newKeywords);
    setInputValue('');

    // Remove from suggestions if present
    setSuggestions(suggestions.filter(s => s !== keyword));
  };

  const handleRemove = keyword => {
    const newKeywords = keywords.filter(k => k !== keyword);
    onChange(newKeywords);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleAddSuggestion = suggestion => {
    if (keywords.length >= 10) return;

    const newKeywords = [...keywords, suggestion];
    onChange(newKeywords);
    setSuggestions(suggestions.filter(s => s !== suggestion));
  };

  const getDensityFromBackend = keyword => {
    return keywordDensities[keyword] || 0;
  };

  return (
    <div className="keywords-input">
      <div className="keywords-input-field">
        <input
          type="text"
          className="keyword-input"
          placeholder="Enter target keyword..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={keywords.length >= 10}
        />
        <Button
          variant="primary"
          size="small"
          onClick={handleAdd}
          disabled={!inputValue.trim() || keywords.length >= 10}
        >
          + Add
        </Button>
      </div>

      {keywords.length >= 10 && (
        <p className="keyword-limit-message">
          Maximum 10 keywords reached. Remove some to add more.
        </p>
      )}

      {/* Current Keywords */}
      {keywords.length > 0 && (
        <div className="keywords-list">
          <label className="keywords-label">
            Target Keywords ({keywords.length}/10)
          </label>
          <div className="keywords-chips">
            {keywords.map((keyword, index) => {
              const density = getDensityFromBackend(keyword);
              const densityLevel =
                density >= 2 ? 'high' : density >= 1 ? 'medium' : 'low';

              return (
                <div key={index} className={`keyword-chip ${densityLevel}`}>
                  <span className="chip-text">{keyword}</span>
                  {content && (
                    <Badge
                      variant={
                        density >= 2
                          ? 'success'
                          : density >= 1
                            ? 'warning'
                            : 'default'
                      }
                      size="small"
                    >
                      {density}%
                    </Badge>
                  )}
                  <button
                    className="chip-remove"
                    onClick={() => handleRemove(keyword)}
                    aria-label={`Remove ${keyword}`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Keyword Suggestions */}
      {suggestions.length > 0 && keywords.length < 10 && (
        <div className="keywords-suggestions">
          <label className="keywords-label">
            💡 Suggested Keywords (from content)
          </label>
          <div className="suggestions-chips">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => handleAddSuggestion(suggestion)}
              >
                {suggestion}
                <span className="chip-add">+</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {keywords.length === 0 && (
        <div className="keywords-help">
          <p className="help-text">
            Add 1-10 target keywords to optimize your content for. Keywords will
            be checked for density and placement.
          </p>
        </div>
      )}

      {/* Density Guide */}
      {keywords.length > 0 && content && (
        <div className="density-guide">
          <p className="guide-title">Keyword Density Guide:</p>
          <ul className="guide-list">
            <li>
              <Badge variant="success" size="small">
                2%+
              </Badge>
              <span>Good density - keyword appears frequently</span>
            </li>
            <li>
              <Badge variant="warning" size="small">
                1-2%
              </Badge>
              <span>Moderate - consider adding more instances</span>
            </li>
            <li>
              <Badge variant="default" size="small">
                &lt;1%
              </Badge>
              <span>Low - keyword rarely appears</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

KeywordsInput.propTypes = {
  keywords: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  content: PropTypes.string,
};

export default KeywordsInput;
