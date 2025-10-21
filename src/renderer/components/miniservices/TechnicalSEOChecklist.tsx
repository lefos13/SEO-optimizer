/**
 * Technical SEO Checklist Component
 * Comprehensive technical SEO checklist with progress tracking
 */
import React, { useState } from 'react';
import MiniServiceContainer from './MiniServiceContainer';
import Card from '../ui/Card';
import { generateChecklist } from '../../../analyzers/technical';
import type {
  TechnicalChecklist,
  ChecklistItem,
} from '../../../analyzers/technical';

const TechnicalSEOChecklist: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [checklist, setChecklist] = useState<TechnicalChecklist>(() =>
    generateChecklist([])
  );
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const handleToggleItem = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
    setChecklist(generateChecklist(Array.from(newChecked)));
  };

  const getFilteredItems = (items: ChecklistItem[]) => {
    if (filterPriority === 'all') return items;
    return items.filter(item => item.priority === filterPriority);
  };

  const renderInputs = () => (
    <div className="input-section">
      <div className="filter-section">
        <label>Filter by Priority:</label>
        <select
          className="form-control"
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
        >
          <option value="all">All Items</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="results-section">
      <Card className="summary-card">
        <h3>📋 Checklist Progress</h3>
        <div className="progress-section">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${checklist.progress}%` }}
            />
          </div>
          <div className="progress-text">
            {checklist.checkedItems} / {checklist.totalItems} items completed (
            {Math.round(checklist.progress)}%)
          </div>
        </div>
      </Card>

      <div className="checklist-section">
        {checklist.categories.map(category => {
          const filteredItems = getFilteredItems(category.items);
          if (filteredItems.length === 0) return null;

          return (
            <div key={category.id} className="category-card">
              <div className="category-header">
                <h4>
                  {category.name}
                  <span className="completion-badge">
                    {Math.round(category.completion)}%
                  </span>
                </h4>
                <p>{category.description}</p>
              </div>

              <div className="items-list">
                {filteredItems.map(item => (
                  <div key={item.id} className="checklist-item">
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={checkedItems.has(item.id)}
                      onChange={() => handleToggleItem(item.id)}
                    />
                    <label htmlFor={item.id}>
                      <div className="item-header">
                        <span className="item-title">{item.title}</span>
                        <span
                          className={`priority-badge priority-${item.priority}`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <div className="item-description">{item.description}</div>
                      <div className="item-tags">
                        {item.tags.map(tag => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <MiniServiceContainer
      title="Technical SEO Checklist"
      description="Complete technical SEO checklist to ensure best practices"
      onAnalyze={() => {
        /* no-op for checklist */
      }}
      loading={false}
      error={null}
      results={{}} // always show results
      inputCardTitle="Checklist Controls"
      renderInputs={renderInputs}
      renderResults={renderResults}
      hideActions={true}
    />
  );
};

export default TechnicalSEOChecklist;
