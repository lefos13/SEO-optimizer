/**
 * ExportResults Component
 * Provides export functionality for analysis results
 * Features:
 * - Export to JSON
 * - Export to CSV
 * - Export to PDF (print-friendly)
 * - Customizable export options
 */
import React, { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

type ExportFormat = 'json' | 'csv' | 'pdf';

interface ExportFormatOption {
  value: ExportFormat;
  label: string;
  icon: string;
  description: string;
}

interface ExportOptions {
  format: ExportFormat;
  includeRecommendations: boolean;
  includeScores: boolean;
  includeCategoryBreakdown: boolean;
  includeMetadata: boolean;
}

interface CategoryScore {
  score: number;
  maxScore: number;
  passed?: number;
  failed?: number;
}

interface Analysis {
  score?: number;
  maxScore?: number;
  grade?: string;
  categoryScores?: Record<string, CategoryScore>;
  passedRules?: number;
  failedRules?: number;
  warnings?: number;
  projectName?: string;
  url?: string;
  createdAt?: string;
}

interface Recommendation {
  title: string;
  description?: string;
  message?: string;
  priority: string;
  status?: string;
  impact: string;
  category?: string;
  explanation?: string;
  howToFix?: string;
}

interface ExportData {
  metadata?: {
    exportDate: string;
    analysisDate: string;
    projectName: string;
    url: string;
  };
  scores?: {
    overall: {
      score: number;
      maxScore: number;
      percentage: number;
      grade: string;
    };
    passed: number;
    failed: number;
    warnings: number;
  };
  categoryBreakdown?: Array<{
    category: string;
    score: number;
    maxScore: number;
    percentage: number;
    passed: number;
    failed: number;
  }>;
  recommendations?: Array<{
    title: string;
    description: string;
    priority: string;
    status: string;
    impact: string;
    category?: string;
    explanation?: string;
    howToFix?: string;
  }>;
}

export interface ExportResultsProps {
  analysis?: Analysis;
  recommendations?: Recommendation[];
  onExport?: (format: ExportFormat, data: ExportData) => void;
}

const ExportResults: React.FC<ExportResultsProps> = ({
  analysis,
  recommendations,
  onExport,
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeRecommendations: true,
    includeScores: true,
    includeCategoryBreakdown: true,
    includeMetadata: true,
  });

  const exportFormats: ExportFormatOption[] = [
    {
      value: 'json',
      label: 'JSON',
      icon: '📄',
      description: 'Machine-readable format',
    },
    {
      value: 'csv',
      label: 'CSV',
      icon: '📊',
      description: 'Spreadsheet compatible',
    },
    {
      value: 'pdf',
      label: 'PDF',
      icon: '📑',
      description: 'Print-friendly report',
    },
  ];

  const handleExport = async (): Promise<void> => {
    const data = prepareExportData();

    switch (exportOptions.format) {
      case 'json':
        await exportAsJSON(data);
        break;
      case 'csv':
        await exportAsCSV(data);
        break;
      case 'pdf':
        await exportAsPDF(data);
        break;
      default:
        console.error('Unknown export format');
    }

    if (onExport) {
      onExport(exportOptions.format, data);
    }

    setShowExportModal(false);
  };

  const prepareExportData = (): ExportData => {
    const data: ExportData = {};

    if (exportOptions.includeMetadata) {
      data.metadata = {
        exportDate: new Date().toISOString(),
        analysisDate: analysis?.createdAt || new Date().toISOString(),
        projectName: analysis?.projectName || 'Unknown',
        url: analysis?.url || '',
      };
    }

    if (exportOptions.includeScores) {
      const score = analysis?.score || 0;
      const maxScore = analysis?.maxScore || 206;
      data.scores = {
        overall: {
          score,
          maxScore,
          percentage: Math.round((score / maxScore) * 100),
          grade: analysis?.grade || 'N/A',
        },
        passed: analysis?.passedRules || 0,
        failed: analysis?.failedRules || 0,
        warnings: analysis?.warnings || 0,
      };
    }

    if (exportOptions.includeCategoryBreakdown && analysis?.categoryScores) {
      data.categoryBreakdown = Object.entries(analysis.categoryScores).map(
        ([category, scores]) => ({
          category,
          score: scores.score,
          maxScore: scores.maxScore,
          percentage: Math.round((scores.score / scores.maxScore) * 100),
          passed: scores.passed || 0,
          failed: scores.failed || 0,
        })
      );
    }

    if (exportOptions.includeRecommendations && recommendations) {
      data.recommendations = recommendations.map(rec => ({
        title: rec.title,
        description: rec.description || rec.message || '',
        priority: rec.priority,
        status: rec.status || 'pending',
        impact: rec.impact,
        category: rec.category,
        explanation: rec.explanation,
        howToFix: rec.howToFix,
      }));
    }

    return data;
  };

  const exportAsJSON = async (data: ExportData): Promise<void> => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    downloadFile(blob, `seo-analysis-${Date.now()}.json`);
  };

  const exportAsCSV = async (data: ExportData): Promise<void> => {
    let csv = '';

    // Header
    csv += 'SEO Analysis Report\n\n';

    // Metadata
    if (data.metadata) {
      csv += 'Metadata\n';
      csv += `Export Date,${data.metadata.exportDate}\n`;
      csv += `Analysis Date,${data.metadata.analysisDate}\n`;
      csv += `Project,${data.metadata.projectName}\n`;
      csv += `URL,${data.metadata.url}\n\n`;
    }

    // Overall Scores
    if (data.scores) {
      csv += 'Overall Score\n';
      csv += `Score,${data.scores.overall.score}\n`;
      csv += `Max Score,${data.scores.overall.maxScore}\n`;
      csv += `Percentage,${data.scores.overall.percentage}%\n`;
      csv += `Grade,${data.scores.overall.grade}\n`;
      csv += `Passed Rules,${data.scores.passed}\n`;
      csv += `Failed Rules,${data.scores.failed}\n\n`;
    }

    // Category Breakdown
    if (data.categoryBreakdown) {
      csv += 'Category Breakdown\n';
      csv += 'Category,Score,Max Score,Percentage,Passed,Failed\n';
      data.categoryBreakdown.forEach(cat => {
        csv += `${cat.category},${cat.score},${cat.maxScore},${cat.percentage}%,${cat.passed},${cat.failed}\n`;
      });
      csv += '\n';
    }

    // Recommendations
    if (data.recommendations) {
      csv += 'Recommendations\n';
      csv += 'Priority,Title,Description,Status,Impact,Category\n';
      data.recommendations.forEach(rec => {
        const desc = (rec.description || '')
          .replace(/,/g, ';')
          .replace(/\n/g, ' ');
        csv += `${rec.priority},${rec.title},"${desc}",${rec.status},${rec.impact},${rec.category || ''}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    downloadFile(blob, `seo-analysis-${Date.now()}.csv`);
  };

  const exportAsPDF = async (data: ExportData): Promise<void> => {
    // For PDF export, we'll use the browser's print functionality with a print-friendly layout
    // Create a new window with the formatted content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      return;
    }

    const htmlContent = generatePrintableHTML(data);
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Trigger print dialog after content loads
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const generatePrintableHTML = (data: ExportData): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SEO Analysis Report</title>
        <style>
          @media print {
            @page { margin: 2cm; }
            body { margin: 0; }
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
          h2 { color: #1e40af; margin-top: 30px; border-bottom: 2px solid #ddd; padding-bottom: 5px; }
          h3 { color: #3b82f6; margin-top: 20px; }
          .metadata { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .score-box { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .score-large { font-size: 48px; font-weight: bold; color: #1e40af; }
          .grade { display: inline-block; padding: 10px 20px; background: #10b981; color: white; border-radius: 5px; font-size: 24px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f3f4f6; font-weight: bold; }
          .recommendation { margin: 15px 0; padding: 15px; border-left: 4px solid #3b82f6; background: #f9fafb; page-break-inside: avoid; }
          .priority-critical { border-left-color: #dc2626; }
          .priority-high { border-left-color: #f59e0b; }
          .priority-medium { border-left-color: #3b82f6; }
          .priority-low { border-left-color: #6b7280; }
          .rec-title { font-weight: bold; font-size: 16px; margin-bottom: 8px; }
          .rec-meta { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
          .rec-desc { color: #4b5563; }
        </style>
      </head>
      <body>
        <h1>🔍 SEO Analysis Report</h1>
        
        ${
          data.metadata
            ? `
          <div class="metadata">
            <strong>Project:</strong> ${data.metadata.projectName}<br>
            <strong>URL:</strong> ${data.metadata.url}<br>
            <strong>Analysis Date:</strong> ${new Date(data.metadata.analysisDate).toLocaleString()}<br>
            <strong>Export Date:</strong> ${new Date(data.metadata.exportDate).toLocaleString()}
          </div>
        `
            : ''
        }

        ${
          data.scores
            ? `
          <h2>📊 Overall Score</h2>
          <div class="score-box">
            <div class="score-large">${data.scores.overall.score} / ${data.scores.overall.maxScore}</div>
            <p><span class="grade">Grade: ${data.scores.overall.grade}</span></p>
            <p>${data.scores.overall.percentage}% - ${data.scores.passed} Passed, ${data.scores.failed} Failed</p>
          </div>
        `
            : ''
        }

        ${
          data.categoryBreakdown
            ? `
          <h2>📈 Category Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Passed</th>
                <th>Failed</th>
              </tr>
            </thead>
            <tbody>
              ${data.categoryBreakdown
                .map(
                  cat => `
                <tr>
                  <td>${cat.category}</td>
                  <td>${cat.score} / ${cat.maxScore}</td>
                  <td>${cat.percentage}%</td>
                  <td>${cat.passed}</td>
                  <td>${cat.failed}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        `
            : ''
        }

        ${
          data.recommendations
            ? `
          <h2>💡 Recommendations</h2>
          ${data.recommendations
            .map(
              rec => `
            <div class="recommendation priority-${rec.priority}">
              <div class="rec-title">${rec.title}</div>
              <div class="rec-meta">
                Priority: <strong>${rec.priority.toUpperCase()}</strong> | 
                Impact: ${rec.impact} | 
                Status: ${rec.status}
              </div>
              <div class="rec-desc">${rec.description}</div>
              ${rec.howToFix ? `<div style="margin-top: 8px;"><strong>How to Fix:</strong> ${rec.howToFix}</div>` : ''}
            </div>
          `
            )
            .join('')}
        `
            : ''
        }
      </body>
      </html>
    `;
  };

  const downloadFile = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setShowExportModal(true)}>
        📥 Export Results
      </Button>

      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Analysis Results"
        size="medium"
      >
        <div className="export-modal-content">
          <div className="export-formats">
            <label className="form-label">Select Format</label>
            <div className="format-options">
              {exportFormats.map(format => (
                <button
                  key={format.value}
                  className={`format-option ${exportOptions.format === format.value ? 'active' : ''}`}
                  onClick={() =>
                    setExportOptions({ ...exportOptions, format: format.value })
                  }
                >
                  <span className="format-icon">{format.icon}</span>
                  <div className="format-info">
                    <div className="format-label">{format.label}</div>
                    <div className="format-desc">{format.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="export-options">
            <label className="form-label">Include in Export</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exportOptions.includeScores}
                  onChange={e =>
                    setExportOptions({
                      ...exportOptions,
                      includeScores: e.target.checked,
                    })
                  }
                />
                <span>Overall Scores</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exportOptions.includeCategoryBreakdown}
                  onChange={e =>
                    setExportOptions({
                      ...exportOptions,
                      includeCategoryBreakdown: e.target.checked,
                    })
                  }
                />
                <span>Category Breakdown</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exportOptions.includeRecommendations}
                  onChange={e =>
                    setExportOptions({
                      ...exportOptions,
                      includeRecommendations: e.target.checked,
                    })
                  }
                />
                <span>Recommendations</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={e =>
                    setExportOptions({
                      ...exportOptions,
                      includeMetadata: e.target.checked,
                    })
                  }
                />
                <span>Metadata</span>
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowExportModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleExport}>
            Export {exportOptions.format.toUpperCase()}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ExportResults;
