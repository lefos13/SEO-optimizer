/**
 * ContentInput Component
 * Multiple input methods for content analysis
 * Features:
 * - URL input with fetching
 * - Direct text input
 * - File upload (HTML, TXT, MD)
 * - Input validation
 * - Tab-based interface
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';

const ContentInput = ({
  onContentChange,
  onUrlChange,
  initialContent = '',
  initialUrl = '',
}) => {
  const [activeTab, setActiveTab] = useState('text');
  const [content, setContent] = useState(initialContent);
  const [url, setUrl] = useState(initialUrl);
  const [urlFetching, setUrlFetching] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [fileError, setFileError] = useState('');

  const tabs = [
    { id: 'text', label: 'Direct Text', icon: '📝' },
    { id: 'url', label: 'Fetch from URL', icon: '🔗' },
    { id: 'file', label: 'Upload File', icon: '📄' },
  ];

  const handleTextChange = value => {
    setContent(value);
    if (onContentChange) {
      onContentChange(value);
    }
  };

  const handleUrlChange = value => {
    setUrl(value);
    setUrlError('');
    if (onUrlChange) {
      onUrlChange(value);
    }
  };

  const validateUrl = urlString => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  const handleFetchUrl = async () => {
    if (!url) {
      setUrlError('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      setUrlError('Please enter a valid HTTP or HTTPS URL');
      return;
    }

    setUrlFetching(true);
    setUrlError('');

    try {
      // eslint-disable-next-line no-console
      console.log('[CONTENT-INPUT] 🔗 Fetching URL:', url);

      // Call the backend URL fetcher via IPC
      const result = await window.electronAPI.seo.fetchUrl(url, {
        timeout: 15000, // 15 seconds timeout
        maxRedirects: 5,
      });

      // eslint-disable-next-line no-console
      console.log('[CONTENT-INPUT] ✅ URL fetched:', {
        finalUrl: result.finalUrl,
        title: result.title,
        htmlLength: result.html?.length || 0,
      });

      // Use the fetched HTML content
      if (result.html) {
        setContent(result.html);

        if (onContentChange) {
          onContentChange(result.html);
        }

        // Also update the URL if it was redirected
        if (result.finalUrl && result.finalUrl !== url) {
          setUrl(result.finalUrl);
          if (onUrlChange) {
            onUrlChange(result.finalUrl);
          }
        }

        setActiveTab('text'); // Switch to text tab to show fetched content
      } else {
        throw new Error('No content received from URL');
      }
    } catch (error) {
      const errorMessage =
        error.message ||
        'Failed to fetch URL. Please check the URL and try again.';
      setUrlError(errorMessage);
      // eslint-disable-next-line no-console
      console.error('[CONTENT-INPUT] ❌ URL fetch error:', error);
    } finally {
      setUrlFetching(false);
    }
  };

  const handleFileUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError('');

    // Validate file type
    const validTypes = ['.txt', '.html', '.htm', '.md', '.markdown'];
    const fileExtension = file.name
      .substring(file.name.lastIndexOf('.'))
      .toLowerCase();

    if (!validTypes.includes(fileExtension)) {
      setFileError(
        `Invalid file type. Please upload ${validTypes.join(', ')} files only.`
      );
      event.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setFileError('File is too large. Maximum size is 5MB.');
      event.target.value = '';
      return;
    }

    try {
      const text = await file.text();
      setContent(text);

      if (onContentChange) {
        onContentChange(text);
      }

      setActiveTab('text'); // Switch to text tab to show uploaded content
    } catch (error) {
      setFileError('Failed to read file. Please try again.');
      console.error('File read error:', error);
    }

    // Reset file input
    event.target.value = '';
  };

  const getContentStats = () => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0).length;
    const characters = content.length;
    const charactersNoSpaces = content.replace(/\s/g, '').length;
    return { words, characters, charactersNoSpaces };
  };

  const stats = getContentStats();

  return (
    <div className="content-input">
      {/* Input Method Tabs */}
      <div className="input-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`input-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="input-content">
        {activeTab === 'text' && (
          <div className="input-text">
            <div className="textarea-wrapper">
              <textarea
                className="content-textarea"
                placeholder="Paste your content here for SEO analysis...&#10;&#10;Include your article text, page content, or any text you want to analyze."
                value={content}
                onChange={e => handleTextChange(e.target.value)}
                rows={15}
              />

              {/* Content Stats */}
              {content && (
                <div className="content-stats">
                  <Badge variant="default" size="small">
                    {stats.words} {stats.words === 1 ? 'word' : 'words'}
                  </Badge>
                  <Badge variant="default" size="small">
                    {stats.characters}{' '}
                    {stats.characters === 1 ? 'character' : 'characters'}
                  </Badge>
                  <Badge variant="default" size="small">
                    {Math.ceil(stats.words / 200)} min read
                  </Badge>
                </div>
              )}
            </div>

            {!content && (
              <div className="input-help">
                <p className="help-title">💡 Tips for best results:</p>
                <ul className="help-list">
                  <li>Include your full article or page content</li>
                  <li>
                    Do not forget meta titles and descriptions if available
                  </li>
                  <li>Minimum 100 words recommended for accurate analysis</li>
                  <li>HTML tags will be automatically stripped</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'url' && (
          <div className="input-url">
            <div className="url-input-group">
              <Input
                type="url"
                label="Website URL"
                placeholder="https://example.com/page"
                value={url}
                onChange={e => handleUrlChange(e.target.value)}
                error={urlError}
                fullWidth
              />

              <Button
                variant="primary"
                onClick={handleFetchUrl}
                disabled={urlFetching || !url}
                fullWidth
              >
                {urlFetching ? '⏳ Fetching...' : '🔍 Fetch & Analyze'}
              </Button>
            </div>

            <div className="url-help">
              <p className="help-title">📡 URL Fetching:</p>
              <ul className="help-list">
                <li>We will extract the page content automatically</li>
                <li>Meta tags, headings, and text content will be analyzed</li>
                <li>Works with most public websites</li>
                <li>Some sites may block automated fetching</li>
              </ul>

              {content && (
                <div className="url-success">
                  <Badge variant="success" size="large">
                    ✓ Content fetched successfully
                  </Badge>
                  <p className="success-text">
                    Switch to Direct Text tab to view and edit the fetched
                    content
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'file' && (
          <div className="input-file">
            <div className="file-upload-area">
              <input
                type="file"
                id="file-upload"
                className="file-input"
                accept=".txt,.html,.htm,.md,.markdown"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload" className="file-upload-label">
                <div className="upload-icon">📤</div>
                <div className="upload-text">
                  <p className="upload-title">
                    Click to upload or drag and drop
                  </p>
                  <p className="upload-subtitle">TXT, HTML, MD (max 5MB)</p>
                </div>
              </label>
            </div>

            {fileError && (
              <div className="file-error">
                <Badge variant="danger">⚠ {fileError}</Badge>
              </div>
            )}

            <div className="file-help">
              <p className="help-title">📁 Supported File Types:</p>
              <ul className="help-list">
                <li>
                  <strong>.txt</strong> - Plain text files
                </li>
                <li>
                  <strong>.html / .htm</strong> - HTML documents
                </li>
                <li>
                  <strong>.md / .markdown</strong> - Markdown files
                </li>
              </ul>
              <p className="help-note">
                Maximum file size: 5MB. Files will be processed locally.
              </p>

              {content && (
                <div className="file-success">
                  <Badge variant="success" size="large">
                    ✓ File uploaded successfully
                  </Badge>
                  <p className="success-text">
                    Switch to Direct Text tab to view and edit the content
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ContentInput.propTypes = {
  onContentChange: PropTypes.func,
  onUrlChange: PropTypes.func,
  initialContent: PropTypes.string,
  initialUrl: PropTypes.string,
};

export default ContentInput;
