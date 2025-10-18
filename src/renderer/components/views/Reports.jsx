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

const MiniServices = () => {
  const [activeTab, setActiveTab] = useState('density');

  const tabs = [
    { id: 'density', label: 'Keyword Density', icon: '🔍' },
    { id: 'longtail', label: 'Long-tail Keywords', icon: '🎯' },
    { id: 'difficulty', label: 'Keyword Difficulty', icon: '�' },
    { id: 'clustering', label: 'Keyword Clustering', icon: '🔗' },
    { id: 'lsi', label: 'LSI Keywords', icon: '�' },
  ];

  const renderTabContent = () => {
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
        <div className="tabs-container">
          <div className="tabs-header">
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

          <div className="tabs-content">{renderTabContent()}</div>
        </div>
      </Card>
    </div>
  );
};

export default MiniServices;
