# SEO Analyzer API Documentation

## Overview

This document provides comprehensive documentation for all SEO analysis services, including backend analyzers, IPC handlers, and data structures. Use this as a reference for frontend integration.

---

## Table of Contents

1. [SEO Analyzer Service](#1-seo-analyzer-service)
2. [Recommendation Engine](#2-recommendation-engine)
3. [HTML Parser](#3-html-parser)
4. [IPC Interface](#4-ipc-interface)
5. [Database Persistence](#5-database-persistence)
6. [Data Structures](#6-data-structures)
7. [Frontend Integration Guide](#7-frontend-integration-guide)

---

## 1. SEO Analyzer Service

**File:** `src/analyzers/seoAnalyzer.js`

### Main Class: `SEOAnalyzer`

#### Constructor

```javascript
const analyzer = new SEOAnalyzer((language = 'en'));
```

**Parameters:**

- `language` (string, optional): Language code - `'en'` or `'el'` (Greek). Default: `'en'`

---

### Methods

#### `async analyze(content)`

Main analysis method that performs comprehensive SEO analysis.

**Parameters:**

```javascript
content = {
  html: string, // HTML content to analyze
  title: string, // Page title (optional, extracted from HTML if not provided)
  description: string, // Meta description (optional)
  keywords: string, // Comma-separated keywords (e.g., "seo,optimization,content")
  language: string, // Language code: 'en' or 'el'
  url: string, // Page URL (optional)
};
```

**Returns:**

```javascript
{
  // Basic Scoring
  score: number,              // Total score achieved (0-100)
  maxScore: number,           // Maximum possible score (100)
  percentage: number,         // Percentage score (0-100)
  grade: string,              // Letter grade: 'A', 'B', 'C', 'D', 'F'

  // Rule Statistics
  passedRules: number,        // Number of rules passed
  failedRules: number,        // Number of rules failed
  warnings: number,           // Number of warnings

  // Issues Array
  issues: [
    {
      id: string,             // Rule ID (e.g., "meta-title-length")
      category: string,       // Category: 'meta', 'content', 'technical', 'readability'
      severity: string,       // Severity: 'error' or 'warning'
      title: string,          // Issue title
      description: string,    // Detailed description
      impact: number          // Impact score on SEO (0-10)
    }
  ],

  // Simple Recommendations (Legacy)
  recommendations: [
    {
      ruleId: string,
      category: string,
      recommendation: string
    }
  ],

  // Detailed Metadata
  metadata: {
    title: string,
    description: string,
    keywords: string[],       // Array of keywords
    language: string,
    url: string,
    wordCount: number,
    characterCount: number,

    // Headings structure
    headings: {
      h1: string[],
      h2: string[],
      h3: string[],
      h4: string[],
      h5: string[],
      h6: string[]
    },

    // Images
    images: [
      {
        src: string,
        alt: string,
        title: string,
        hasAlt: boolean,
        hasTitle: boolean
      }
    ],

    // Links
    links: {
      internal: number,
      external: number,
      total: number,
      broken: number          // Currently 0 (not implemented)
    },

    // Meta tags
    metaTags: {
      viewport: string,
      canonical: string,
      robots: string,
      charset: string,
      language: string
    },

    // Structural elements
    structuralElements: {
      hasNav: boolean,
      hasHeader: boolean,
      hasFooter: boolean,
      hasMain: boolean,
      hasArticle: boolean,
      semanticScore: number   // 0-5 points
    }
  },

  // Enhanced Recommendations (from RecommendationEngine)
  enhancedRecommendations: {
    recommendations: [],      // See section 2 for structure
    summary: {},
    byPriority: {},
    byCategory: {},
    byEffort: {},
    quickWins: []
  }
}
```

---

#### `calculateKeywordDensity(text, keyword)`

Calculate keyword density for a single keyword.

**Parameters:**

- `text` (string): Text content to analyze
- `keyword` (string): Keyword to search for

**Returns:**

```javascript
{
  keyword: string,
  count: number,           // Number of occurrences
  density: number,         // Percentage (0-100)
  wordCount: number        // Total words in text
}
```

**Example:**

```javascript
const result = analyzer.calculateKeywordDensity(
  'SEO is important. SEO optimization helps SEO rankings.',
  'seo'
);
// Returns: { keyword: 'seo', count: 3, density: 33.33, wordCount: 9 }
```

---

#### `calculateAllKeywordDensities(text, keywords)`

Calculate densities for multiple keywords.

**Parameters:**

- `text` (string): Text content to analyze
- `keywords` (array): Array of keyword strings

**Returns:**

```javascript
[
  {
    keyword: string,
    count: number,
    density: number,
    wordCount: number,
  },
];
```

---

#### `setLanguage(language)`

Change the analyzer language.

**Parameters:**

- `language` (string): `'en'` or `'el'`

**Returns:** `void`

---

### Grading Scale

| Grade | Percentage | Description |
| ----- | ---------- | ----------- |
| A     | 90-100%    | Excellent   |
| B     | 80-89%     | Good        |
| C     | 70-79%     | Average     |
| D     | 60-69%     | Poor        |
| F     | 0-59%      | Failing     |

---

## 2. Recommendation Engine

**File:** `src/analyzers/recommendationEngine.js`

### Main Class: `RecommendationEngine`

#### Constructor

```javascript
const engine = new RecommendationEngine((language = 'en'));
```

---

### Methods

#### `generateRecommendations(analysisResults, rules)`

Generate comprehensive, actionable recommendations.

**Parameters:**

- `analysisResults` (object): Results from `SEOAnalyzer.analyze()`
- `rules` (array): Array of SEO rule objects

**Returns:**

```javascript
{
  // Main recommendations array
  recommendations: [
    {
      id: string,                    // Unique ID (e.g., "rec_1234567890_meta-title-length")
      ruleId: string,                // Rule ID
      title: string,                 // Recommendation title
      priority: string,              // 'critical', 'high', 'medium', 'low'
      category: string,              // 'meta', 'content', 'technical', 'readability'
      description: string,           // Detailed explanation

      // Action steps
      actions: [
        {
          step: number,              // Step number (1, 2, 3...)
          action: string,            // Action description
          type: string,              // 'action', 'check', 'note'
          specific: boolean          // Is this action specific to the content?
        }
      ],

      // Effort estimation
      effort: string,                // 'quick', 'moderate', 'significant'
      estimatedTime: string,         // Human-readable time (e.g., "15-30 minutes")

      // Impact estimation
      impactEstimate: {
        scoreIncrease: number,       // Estimated score increase (0-10)
        percentageIncrease: number,  // Percentage increase (0-100)
        currentScore: number,        // Current score
        projectedScore: number,      // Projected score after fix
        rankingImpact: string        // 'high', 'medium', 'low'
      },

      // Before/After example
      example: {
        before: string,              // Example of current state
        after: string                // Example of improved state
      },

      // Additional info
      why: string,                   // Why this matters for SEO
      resources: [
        {
          title: string,
          url: string
        }
      ],

      // Metadata
      weight: number,                // Rule weight (0-10)
      severity: string,              // 'error' or 'warning'
      timestamp: number              // Unix timestamp
    }
  ],

  // Summary statistics
  summary: {
    totalRecommendations: number,
    priorityCounts: {
      critical: number,
      high: number,
      medium: number,
      low: number
    },
    effortCounts: {
      quick: number,
      moderate: number,
      significant: number
    },
    currentScore: number,
    potentialScore: number,
    currentGrade: string,
    potentialGrade: string,
    totalPotentialIncrease: number
  },

  // Grouped recommendations
  byPriority: {
    critical: [],
    high: [],
    medium: [],
    low: []
  },

  byCategory: {
    meta: [],
    content: [],
    technical: [],
    readability: []
  },

  byEffort: {
    quick: [],
    moderate: [],
    significant: []
  },

  // Quick wins (top 5 high-impact, low-effort recommendations)
  quickWins: []
}
```

---

### Priority Levels

| Priority | Description                       |
| -------- | --------------------------------- |
| critical | Severe issues, fix immediately    |
| high     | Important issues, fix soon        |
| medium   | Notable issues, fix when possible |
| low      | Minor improvements, optional      |

---

### Effort Levels

| Effort      | Time Estimate    | Description                   |
| ----------- | ---------------- | ----------------------------- |
| quick       | < 30 minutes     | Simple, fast fixes            |
| moderate    | 30 min - 2 hours | Requires some work            |
| significant | > 2 hours        | Complex, time-consuming fixes |

---

## 3. HTML Parser

**File:** `src/analyzers/htmlParser.js`

### Main Function: `parse(html)`

Parse HTML and extract SEO-relevant information.

**Parameters:**

- `html` (string): HTML content to parse

**Returns:**

```javascript
{
  text: string,                    // Plain text (HTML stripped)
  html: string,                    // Original HTML
  wordCount: number,
  characterCount: number,

  headings: {
    h1: string[],
    h2: string[],
    h3: string[],
    h4: string[],
    h5: string[],
    h6: string[]
  },

  images: [
    {
      src: string,
      alt: string,
      title: string,
      hasAlt: boolean,
      hasTitle: boolean
    }
  ],

  links: [
    {
      href: string,
      text: string,
      rel: string,
      type: string,              // 'internal', 'external', 'email', 'phone', 'anchor'
      hasText: boolean
    }
  ],

  paragraphs: string[],

  readability: {
    score: number,               // Flesch Reading Ease score (0-100)
    level: string,               // Difficulty level
    description: string          // Grade level description
  },

  metaTags: {
    viewport: string,
    canonical: string,
    robots: string,
    charset: string,
    language: string
  },

  structuralElements: {
    hasNav: boolean,
    hasHeader: boolean,
    hasFooter: boolean,
    hasMain: boolean,
    hasArticle: boolean,
    semanticScore: number        // 0-5 points
  }
}
```

---

### Utility Functions

#### `stripHtmlTags(html)`

Remove all HTML tags and return plain text.

#### `countWords(text)`

Count words in text.

#### `extractHeadings(html)`

Extract all heading elements (h1-h6).

#### `extractImages(html)`

Extract all image elements with attributes.

#### `extractLinks(html)`

Extract all link elements with attributes.

#### `extractParagraphs(html)`

Extract all paragraph elements.

#### `calculateReadingTime(wordCount, wordsPerMinute = 200)`

Calculate estimated reading time.

#### `analyzeReadability(text)`

Calculate Flesch Reading Ease score.

#### `extractMetaTags(html)`

Extract meta tags and canonical links.

#### `extractStructuralElements(html)`

Detect HTML5 semantic elements.

---

## 4. IPC Interface

**File:** `src/preload/preload.js`

All IPC communication is exposed via `window.electronAPI` in the renderer process.

### SEO Analyzer API

Available at: `window.electronAPI.seo`

#### `analyze(content)`

**Usage:**

```javascript
const result = await window.electronAPI.seo.analyze({
  html: '<html>...</html>',
  title: 'Page Title',
  description: 'Meta description',
  keywords: 'seo,optimization',
  language: 'en',
  url: 'https://example.com',
});
```

**Returns:** Complete analysis result object (see Section 1)

---

#### `getRecommendations(analysisId)`

Get recommendations from database for a specific analysis.

**Usage:**

```javascript
const recommendations = await window.electronAPI.seo.getRecommendations(123);
```

**Returns:** Array of recommendation objects from database

---

#### `updateRecommendationStatus(recId, status, notes)`

Update recommendation status.

**Usage:**

```javascript
await window.electronAPI.seo.updateRecommendationStatus(
  456, // Recommendation ID
  'completed', // Status: 'pending', 'in-progress', 'completed', 'dismissed'
  'Fixed the title' // Optional notes
);
```

**Returns:** `void`

---

#### `getQuickWins(analysisId)`

Get top quick win recommendations (high impact, low effort).

**Usage:**

```javascript
const quickWins = await window.electronAPI.seo.getQuickWins(123);
```

**Returns:** Array of up to 5 quick win recommendations

---

### Database API

#### Projects: `window.electronAPI.projects`

- `create(projectData)` - Create new project
- `get(projectId)` - Get project by ID
- `getAll(options)` - Get all projects
- `update(projectId, updates)` - Update project
- `delete(projectId)` - Delete project

#### Analyses: `window.electronAPI.analyses`

- `create(analysisData)` - Create new analysis
- `get(analysisId)` - Get analysis by ID
- `getByProject(projectId, options)` - Get project analyses
- `update(analysisId, updates)` - Update analysis
- `delete(analysisId)` - Delete analysis

#### Rules: `window.electronAPI.rules`

- `create(ruleData)` - Create SEO rule
- `get(ruleId)` - Get rule by ID
- `getAll(options)` - Get all rules
- `getByCategory(category)` - Get rules by category
- `update(ruleId, updates)` - Update rule
- `delete(ruleId)` - Delete rule

#### Results: `window.electronAPI.results`

- `create(resultData)` - Create mini service result
- `get(resultId)` - Get result by ID
- `getByAnalysis(analysisId)` - Get analysis results
- `update(resultId, updates)` - Update result
- `delete(resultId)` - Delete result
- `deleteByAnalysis(analysisId)` - Delete all results for analysis

---

## 5. Database Persistence

**File:** `src/database/recommendationPersistence.js`

### Database Schema

#### `recommendations` table

```sql
- id (PRIMARY KEY)
- analysis_id (FOREIGN KEY)
- rec_id (TEXT)
- rule_id (TEXT)
- title (TEXT)
- priority (TEXT)
- category (TEXT)
- description (TEXT)
- effort (TEXT)
- estimated_time (TEXT)
- score_increase (INTEGER)
- percentage_increase (INTEGER)
- why_explanation (TEXT)
- created_at (DATETIME)
- status (TEXT) -- 'pending', 'in-progress', 'completed', 'dismissed'
```

#### `recommendation_actions` table

```sql
- id (PRIMARY KEY)
- recommendation_id (FOREIGN KEY)
- step (INTEGER)
- action_text (TEXT)
- action_type (TEXT)
- is_specific (BOOLEAN)
- completed (BOOLEAN)
- completed_at (DATETIME)
```

#### `recommendation_examples` table

```sql
- id (PRIMARY KEY)
- recommendation_id (FOREIGN KEY)
- before_example (TEXT)
- after_example (TEXT)
```

#### `recommendation_resources` table

```sql
- id (PRIMARY KEY)
- recommendation_id (FOREIGN KEY)
- title (TEXT)
- url (TEXT)
```

#### `recommendation_status_history` table

```sql
- id (PRIMARY KEY)
- recommendation_id (FOREIGN KEY)
- status (TEXT)
- notes (TEXT)
- changed_at (DATETIME)
```

---

### Persistence Functions

#### `saveRecommendations(db, analysisId, enhancedRecommendations)`

Save enhanced recommendations to database (includes actions, examples, resources).

#### `getRecommendations(db, analysisId)`

Retrieve recommendations with all related data.

#### `updateRecommendationStatus(db, recommendationId, status, notes)`

Update recommendation status and log to history.

#### `getQuickWins(db, analysisId, limit = 5)`

Get quick win recommendations (high priority, quick effort, pending status).

#### `getRecommendationStats(db, analysisId)`

Get statistics about recommendations.

---

## 6. Data Structures

### Analysis Input

```javascript
{
  html: string,          // Required
  title: string,         // Optional
  description: string,   // Optional
  keywords: string,      // Comma-separated, optional
  language: string,      // 'en' or 'el', default: 'en'
  url: string            // Optional
}
```

### Analysis Output (Complete)

See Section 1: `SEOAnalyzer.analyze()` return value

### Recommendation Object (Enhanced)

See Section 2: `recommendations` array structure

### Database Recommendation Object

When retrieved from database via `getRecommendations()`, recommendations have this structure:

```javascript
{
  id: number,                        // Database ID
  analysis_id: number,
  rec_id: string,
  rule_id: string,
  title: string,
  priority: string,
  category: string,
  description: string,
  effort: string,
  estimated_time: string,
  score_increase: number,
  percentage_increase: number,
  why_explanation: string,
  created_at: string,
  status: string,

  // Related data (joined)
  actions: [
    {
      id: number,
      recommendation_id: number,
      step: number,
      action_text: string,
      action_type: string,
      is_specific: number,           // 0 or 1
      completed: number,              // 0 or 1
      completed_at: string
    }
  ],

  example: {
    id: number,
    recommendation_id: number,
    before_example: string,
    after_example: string
  },

  resources: [
    {
      id: number,
      recommendation_id: number,
      title: string,
      url: string
    }
  ]
}
```

---

## 7. Frontend Integration Guide

### Complete Analysis Workflow

```javascript
// 1. Trigger analysis
const analysisData = {
  html: contentHtml,
  title: pageTitle,
  description: metaDescription,
  keywords: 'keyword1,keyword2,keyword3',
  language: 'en',
  url: pageUrl,
};

const result = await window.electronAPI.seo.analyze(analysisData);

// 2. Access basic scores
console.log('Score:', result.score, '/', result.maxScore);
console.log('Grade:', result.grade);
console.log('Percentage:', result.percentage);

// 3. Access metadata
console.log('Word count:', result.metadata.wordCount);
console.log('Headings:', result.metadata.headings);
console.log('Images:', result.metadata.images);
console.log('Links:', result.metadata.links);

// 4. Access enhanced recommendations
const recommendations = result.enhancedRecommendations.recommendations;
const quickWins = result.enhancedRecommendations.quickWins;
const summary = result.enhancedRecommendations.summary;

// 5. Save to database
const savedAnalysis = await window.electronAPI.analyses.create({
  project_id: projectId,
  url: pageUrl,
  score: result.score,
  grade: result.grade,
  recommendations_count: recommendations.length,
  content_snapshot: JSON.stringify(result),
});

// 6. Retrieve recommendations later
const storedRecs = await window.electronAPI.seo.getRecommendations(
  savedAnalysis.id
);

// 7. Display quick wins
const quickWins = await window.electronAPI.seo.getQuickWins(savedAnalysis.id);

// 8. Update recommendation status
await window.electronAPI.seo.updateRecommendationStatus(
  recommendationId,
  'completed',
  'Implemented the fix'
);
```

---

### Using Keyword Density Calculation

**Note:** Currently, keyword density is calculated in the backend during analysis. For real-time UI updates, consider:

**Option 1: Use backend method (recommended)**

```javascript
// This would require adding a new IPC handler
const densities = await window.electronAPI.seo.calculateKeywordDensities(
  textContent,
  ['keyword1', 'keyword2', 'keyword3']
);
```

**Option 2: Client-side calculation (current approach)**

```javascript
// Calculate density locally for immediate UI feedback
function calculateDensity(text, keyword) {
  const words = text.toLowerCase().split(/\s+/);
  const count = words.filter(w => w === keyword.toLowerCase()).length;
  const density = (count / words.length) * 100;
  return { keyword, count, density, wordCount: words.length };
}
```

---

### Displaying Enhanced Recommendations

```javascript
function RecommendationCard({ recommendation }) {
  return (
    <div className="recommendation-card">
      <h3>{recommendation.title}</h3>
      <span className={`priority-${recommendation.priority}`}>
        {recommendation.priority}
      </span>

      <p>{recommendation.description}</p>

      {/* Display action steps */}
      <div className="actions">
        <h4>How to fix:</h4>
        <ol>
          {recommendation.actions.map(action => (
            <li key={action.step} className={`action-${action.type}`}>
              {action.action}
            </li>
          ))}
        </ol>
      </div>

      {/* Display impact */}
      <div className="impact">
        <p>Score increase: +{recommendation.impactEstimate.scoreIncrease}</p>
        <p>Ranking impact: {recommendation.impactEstimate.rankingImpact}</p>
      </div>

      {/* Display example */}
      {recommendation.example && (
        <div className="example">
          <div className="before">
            <strong>Before:</strong>
            <code>{recommendation.example.before}</code>
          </div>
          <div className="after">
            <strong>After:</strong>
            <code>{recommendation.example.after}</code>
          </div>
        </div>
      )}

      {/* Display resources */}
      {recommendation.resources && recommendation.resources.length > 0 && (
        <div className="resources">
          <h4>Learn more:</h4>
          <ul>
            {recommendation.resources.map(resource => (
              <li key={resource.url}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resource.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

### Category Breakdown Display

```javascript
function CategoryScores({ analysis }) {
  // analysis.categoryScores is not directly provided
  // but can be calculated from issues by category

  const categories = ['meta', 'content', 'technical', 'readability'];
  const categoryStats = categories.map(category => {
    const categoryIssues = analysis.issues.filter(i => i.category === category);
    const passed = categoryIssues.filter(i => i.severity !== 'error').length;
    const total = categoryIssues.length;

    return {
      category,
      passed,
      total,
      percentage: total > 0 ? (passed / total) * 100 : 100,
    };
  });

  return (
    <div className="category-breakdown">
      {categoryStats.map(stat => (
        <div key={stat.category} className="category-stat">
          <h4>{stat.category}</h4>
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${stat.percentage}%` }}
            />
          </div>
          <span>
            {stat.passed} / {stat.total}
          </span>
        </div>
      ))}
    </div>
  );
}
```

---

## Integration Checklist

### ✅ Currently Implemented

- [x] Basic SEO analysis via `seo.analyze()`
- [x] Recommendation retrieval via `seo.getRecommendations()`
- [x] Recommendation status updates
- [x] Basic recommendation display
- [x] Project and analysis database operations

### ⚠️ Partially Implemented

- [ ] Enhanced recommendation structure (actions, impact, examples)
- [ ] Keyword density calculation (client-side vs backend)
- [ ] Complete metadata display
- [ ] Quick wins display (using IPC method)

### ❌ Not Implemented

- [ ] Real-time progress tracking during analysis
- [ ] Backend-driven keyword density updates
- [ ] Content type detection integration
- [ ] Comprehensive before/after comparison using backend data
- [ ] Resource links display in recommendations
- [ ] Action step completion tracking

---

## Next Steps for Integration

1. **Update RecommendationsList component** to display:
   - Action steps with checkboxes
   - Impact estimation (score increase, ranking impact)
   - Before/after examples
   - Resource links

2. **Add keyword density IPC handler** for real-time calculations:

   ```javascript
   ipcMain.handle('seo:calculateDensities', (event, text, keywords) => {
     const analyzer = new SEOAnalyzer();
     return analyzer.calculateAllKeywordDensities(text, keywords);
   });
   ```

3. **Use `getQuickWins()` IPC method** instead of client-side filtering

4. **Display full metadata** in results view:
   - Headings structure
   - Image analysis (missing alt tags)
   - Link analysis (internal/external breakdown)
   - Structural elements score

5. **Implement progress tracking** by exposing analysis stages through events or callbacks

---

## Questions or Issues?

Refer to the source files for implementation details:

- `src/analyzers/seoAnalyzer.js` - Main analyzer
- `src/analyzers/recommendationEngine.js` - Recommendation generation
- `src/analyzers/htmlParser.js` - HTML parsing
- `src/main/ipcHandlers.js` - IPC interface
- `src/database/recommendationPersistence.js` - Database operations
