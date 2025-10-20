/**
 * ResultsFilter Component
 * Provides filtering and sorting controls for analysis results
 * Features:
 * - Filter by severity/priority
 * - Filter by category
 * - Filter by status
 * - Sort options
 * - Search functionality
 */
import React from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';

interface Filters {
  priorities?: string[];
  categories?: string[];
  statuses?: string[];
  search?: string;
  sortBy?: string;
}

interface Stats {
  [key: string]: number;
}

export interface ResultsFilterProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onSearchChange: (search: string) => void;
  categories?: string[];
  stats?: Stats;
}

const ResultsFilter: React.FC<ResultsFilterProps> = ({
  filters,
  onFilterChange,
  onSearchChange,
  categories = [],
  stats = {},
}) => {
  const priorities = ['critical', 'high', 'medium', 'low'];
  const statuses = ['pending', 'in-progress', 'completed', 'dismissed'];

  const toggleFilter = (filterType: keyof Filters, value: string): void => {
    const currentFilters = (filters[filterType] || []) as string[];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter((f: string) => f !== value)
      : [...currentFilters, value];

    onFilterChange({
      ...filters,
      [filterType]: newFilters,
    });
  };

  const clearFilters = (): void => {
    onFilterChange({
      priorities: [],
      categories: [],
      statuses: [],
      search: '',
    });
  };

  const hasActiveFilters = (): boolean => {
    return !!(
      (filters.priorities && filters.priorities.length > 0) ||
      (filters.categories && filters.categories.length > 0) ||
      (filters.statuses && filters.statuses.length > 0) ||
      (filters.search && filters.search.length > 0)
    );
  };

  const getFilterCount = (): number => {
    let count = 0;
    if (filters.priorities) count += filters.priorities.length;
    if (filters.categories) count += filters.categories.length;
    if (filters.statuses) count += filters.statuses.length;
    if (filters.search) count += 1;
    return count;
  };

  return (
    <div className="results-filter">
      {/* Search Bar */}
      <div className="filter-search">
        <Input
          type="text"
          placeholder="Search recommendations..."
          value={filters.search || ''}
          onChange={e => onSearchChange(e.target.value)}
          fullWidth
        />
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-header">
          <h4 className="filter-title">Filters</h4>
          {hasActiveFilters() && (
            <div className="filter-actions">
              <Badge variant="info" size="small">
                {getFilterCount()} active
              </Badge>
              <Button variant="ghost" size="small" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Priority Filter */}
        <div className="filter-group">
          <label className="filter-label">Priority</label>
          <div className="filter-options">
            {priorities.map(priority => {
              const isActive = filters.priorities?.includes(priority);
              const count = stats[`${priority}Count`] || 0;

              return (
                <button
                  key={priority}
                  className={`filter-chip ${isActive ? 'active' : ''} ${priority}`}
                  onClick={() => toggleFilter('priorities', priority)}
                  disabled={count === 0}
                >
                  <span className="chip-label">
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </span>
                  <Badge
                    variant={isActive ? 'primary' : 'default'}
                    size="small"
                  >
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <div className="filter-options">
              {categories.map(category => {
                const isActive = filters.categories?.includes(category);

                return (
                  <button
                    key={category}
                    className={`filter-chip ${isActive ? 'active' : ''}`}
                    onClick={() => toggleFilter('categories', category)}
                  >
                    <span className="chip-label">{category}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <div className="filter-options">
            {statuses.map(status => {
              const isActive = filters.statuses?.includes(status);
              const count = stats[`${status}Count`] || 0;

              return (
                <button
                  key={status}
                  className={`filter-chip ${isActive ? 'active' : ''}`}
                  onClick={() => toggleFilter('statuses', status)}
                  disabled={count === 0}
                >
                  <span className="chip-label">
                    {status
                      .split('-')
                      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}
                  </span>
                  <Badge
                    variant={isActive ? 'primary' : 'default'}
                    size="small"
                  >
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsFilter;
