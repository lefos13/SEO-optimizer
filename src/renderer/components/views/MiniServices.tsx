/**
 * SEO Mini-Services View
 * Collection of specialized SEO analysis tools
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import KeywordDensityAnalyzer from '../miniservices/KeywordDensityAnalyzer';
import LongTailKeywordGenerator from '../miniservices/LongTailKeywordGenerator';
import KeywordDifficultyEstimator from '../miniservices/KeywordDifficultyEstimator';
import KeywordClusterer from '../miniservices/KeywordClusterer';
import LSIKeywordGenerator from '../miniservices/LSIKeywordGenerator';
import ReadabilityOverview from '../miniservices/ReadabilityOverview';
import SentenceAnalyzer from '../miniservices/SentenceAnalyzer';
import ReadingLevelGuide from '../miniservices/ReadingLevelGuide';
import ReadabilityImprovements from '../miniservices/ReadabilityImprovements';
import LanguageGuidancePanel from '../miniservices/LanguageGuidancePanel';
import LiveReadabilityScore from '../miniservices/LiveReadabilityScore';
import ContentStructureAnalyzer from '../miniservices/ContentStructureAnalyzer';
import HeadingOptimizer from '../miniservices/HeadingOptimizer';
import InternalLinkRecommender from '../miniservices/InternalLinkRecommender';
import ContentLengthOptimizer from '../miniservices/ContentLengthOptimizer';
import ContentGapAnalyzer from '../miniservices/ContentGapAnalyzer';
import CompetitiveContentAnalyzer from '../miniservices/CompetitiveContentAnalyzer';
import URLStructureAnalyzer from '../miniservices/URLStructureAnalyzer';
import MetaTagGenerator from '../miniservices/MetaTagGenerator';
import SchemaMarkupGenerator from '../miniservices/SchemaMarkupGenerator';
import SitemapAnalyzer from '../miniservices/SitemapAnalyzer';
import RedirectChainAnalyzer from '../miniservices/RedirectChainAnalyzer';
import RobotsTxtAnalyzer from '../miniservices/RobotsTxtAnalyzer';
import TechnicalSEOChecklist from '../miniservices/TechnicalSEOChecklist';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  description: string;
  tabs: Tab[];
}

const MiniServices: React.FC = () => {
  // UI state
  const [activeCategory, setActiveCategory] = useState<string>('keywords');
  const [activeTab, setActiveTab] = useState<string>('density');

  // Categories with their respective tabs
  // Structured to easily add more categories in the future
  const categories: Category[] = [
    {
      id: 'keywords',
      label: 'Keywords',
      icon: '🎯',
      description:
        'Services related to keyword research, analysis and optimization',
      tabs: [
        { id: 'density', label: 'Keyword Density', icon: '🔍' },
        { id: 'longtail', label: 'Long-tail Keywords', icon: '📏' },
        { id: 'difficulty', label: 'Keyword Difficulty', icon: '⚖️' },
        { id: 'clustering', label: 'Keyword Clustering', icon: '🔗' },
        { id: 'lsi', label: 'LSI Keywords', icon: '🧠' },
      ],
    },
    {
      id: 'readability',
      label: 'Readability',
      icon: '📖',
      description:
        'Analyze readability with multi-formula scoring, structural insights and language-aware guidance',
      tabs: [
        { id: 'readability-overview', label: 'Overview', icon: '📊' },
        {
          id: 'readability-structure',
          label: 'Sentence & Paragraphs',
          icon: '🧱',
        },
        {
          id: 'readability-levels',
          label: 'Reading Levels',
          icon: '🎓',
        },
        {
          id: 'readability-improvements',
          label: 'Improvements',
          icon: '💡',
        },
        {
          id: 'readability-language',
          label: 'Language Rules',
          icon: '🌐',
        },
        {
          id: 'readability-live',
          label: 'Live Score',
          icon: '⚡',
        },
      ],
    },
    {
      id: 'content',
      label: 'Content',
      icon: '📝',
      description:
        'Optimize content structure, headings, links, length and analyze gaps against competitors',
      tabs: [
        { id: 'content-structure', label: 'Structure', icon: '🏗️' },
        { id: 'content-headings', label: 'Headings', icon: '📋' },
        { id: 'content-links', label: 'Internal Links', icon: '🔗' },
        { id: 'content-length', label: 'Length', icon: '📏' },
        { id: 'content-gaps', label: 'Topic Gaps', icon: '🔍' },
        { id: 'content-competitive', label: 'Competitive', icon: '📊' },
      ],
    },
    {
      id: 'technical',
      label: 'Technical SEO',
      icon: '⚙️',
      description:
        'Technical SEO tools for URLs, meta tags, schema markup, sitemaps, redirects, and robots.txt',
      tabs: [
        { id: 'technical-url', label: 'URL Analyzer', icon: '🔗' },
        { id: 'technical-meta', label: 'Meta Tags', icon: '🏷️' },
        { id: 'technical-schema', label: 'Schema Markup', icon: '📋' },
        { id: 'technical-sitemap', label: 'Sitemap', icon: '🗺️' },
        { id: 'technical-redirects', label: 'Redirects', icon: '↩️' },
        { id: 'technical-robots', label: 'Robots.txt', icon: '🤖' },
        { id: 'technical-checklist', label: 'Checklist', icon: '✅' },
      ],
    },
    // Example of future categories (commented out for now)
    /*
    {
      id: 'content',
      label: 'Content',
      icon: '📝',
      description: 'Tools for content creation, analysis and optimization',
      tabs: [
        { id: 'readability', label: 'Readability', icon: '📖' },
        { id: 'structure', label: 'Content Structure', icon: '🏗️' },
        { id: 'topics', label: 'Topic Research', icon: '🔎' },
      ],
    },
    {
      id: 'technical',
      label: 'Technical SEO',
      icon: '⚙️',
      description: 'Technical analysis and optimization tools',
      tabs: [
        { id: 'speed', label: 'Page Speed', icon: '⚡' },
        { id: 'mobile', label: 'Mobile Optimization', icon: '📱' },
        { id: 'schema', label: 'Schema Markup', icon: '🏷️' },
      ],
    },
    {
      id: 'backlinks',
      label: 'Backlinks',
      icon: '🔗',
      description: 'Tools for analyzing and managing backlinks',
      tabs: [
        { id: 'analysis', label: 'Link Analysis', icon: '📊' },
        { id: 'opportunities', label: 'Link Building', icon: '🔨' },
      ],
    },
    */
  ];

  // Helper to get tabs for the current category
  const foundCategory = categories.find(c => c.id === activeCategory);
  const currentCategory: Category = (foundCategory ||
    categories[0]) as Category;
  const tabs: Tab[] = currentCategory?.tabs || [];

  const renderTabContent = (): React.ReactNode => {
    switch (activeTab) {
      case 'density':
        return <KeywordDensityAnalyzer />;

      case 'longtail':
        return <LongTailKeywordGenerator />;

      case 'difficulty':
        return <KeywordDifficultyEstimator />;

      case 'clustering':
        return <KeywordClusterer />;

      case 'lsi':
        return <LSIKeywordGenerator />;

      case 'readability-overview':
        return <ReadabilityOverview />;

      case 'readability-structure':
        return <SentenceAnalyzer />;

      case 'readability-levels':
        return <ReadingLevelGuide />;

      case 'readability-improvements':
        return <ReadabilityImprovements />;

      case 'readability-language':
        return <LanguageGuidancePanel />;

      case 'readability-live':
        return <LiveReadabilityScore />;

      case 'content-structure':
        return <ContentStructureAnalyzer />;

      case 'content-headings':
        return <HeadingOptimizer />;

      case 'content-links':
        return <InternalLinkRecommender />;

      case 'content-length':
        return <ContentLengthOptimizer />;

      case 'content-gaps':
        return <ContentGapAnalyzer />;

      case 'content-competitive':
        return <CompetitiveContentAnalyzer />;

      case 'technical-url':
        return <URLStructureAnalyzer />;

      case 'technical-meta':
        return <MetaTagGenerator />;

      case 'technical-schema':
        return <SchemaMarkupGenerator />;

      case 'technical-sitemap':
        return <SitemapAnalyzer />;

      case 'technical-redirects':
        return <RedirectChainAnalyzer />;

      case 'technical-robots':
        return <RobotsTxtAnalyzer />;

      case 'technical-checklist':
        return <TechnicalSEOChecklist />;

      default:
        return null;
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h1 className="view-title">SEO Mini-Services</h1>
        <p className="view-subtitle">
          Specialized tools for advanced SEO analysis and optimization
        </p>
      </div>

      <Card className="mini-services-card">
        <div className="services-grid">
          <div className="categories-sidebar">
            <h3 className="sidebar-title">Categories</h3>
            <div className="category-buttons">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-button ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    // default to first tab of the newly selected category
                    const firstTab =
                      (cat.tabs && cat.tabs[0] && cat.tabs[0].id) || null;
                    if (firstTab) setActiveTab(firstTab);
                  }}
                >
                  {/* Future-proof: Using a placeholder icon that can be added to the category data later */}
                  <span className="category-icon">{cat.icon || '📊'}</span>
                  <span className="category-label">{cat.label}</span>
                </button>
              ))}
            </div>
            <div className="category-info">
              <h4 className="info-title">{currentCategory.label}</h4>
              <p className="info-desc">{currentCategory.description}</p>
            </div>
          </div>

          <div className="content-container">
            <div className="tabs-navigation">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="tab-content-area">{renderTabContent()}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MiniServices;
