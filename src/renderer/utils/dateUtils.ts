/**
 * Date Utility Functions
 * Handles consistent date parsing and formatting across the application
 * Ensures proper timezone handling for dates stored in ISO format
 */

/**
 * Input type for date functions - can be a Date object, ISO string, or null
 */
export type DateInput = string | Date | null | undefined;

/**
 * Parse a date string or Date object to ensure consistent timezone handling
 * @param dateInput - ISO date string or Date object
 * @returns Parsed Date object in local timezone, or null if invalid
 */
export const parseDate = (dateInput: DateInput): Date | null => {
  if (!dateInput) return null;

  // If already a Date object, return it
  if (dateInput instanceof Date) {
    return dateInput;
  }

  // Handle SQLite datetime strings which may not have timezone info
  // SQLite CURRENT_TIMESTAMP returns UTC time but without 'Z' suffix
  let dateStr = String(dateInput).trim();

  // If it looks like an ISO string without timezone (YYYY-MM-DD HH:MM:SS.mmm format)
  // and doesn't end with 'Z' or timezone offset, append 'Z' to treat it as UTC
  if (
    /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(dateStr) &&
    !dateStr.endsWith('Z') &&
    !/[+-]\d{2}:\d{2}$/.test(dateStr)
  ) {
    dateStr = dateStr.replace(' ', 'T') + 'Z';
  }

  // Parse the date string
  const parsed = new Date(dateStr);

  // Validate the parsed date
  if (isNaN(parsed.getTime())) {
    console.warn('Invalid date string:', dateInput);
    return null;
  }

  return parsed;
};

/**
 * Format a date to display in user's local timezone
 * @param date - ISO date string or Date object
 * @param options - Intl.DateTimeFormat options to customize formatting
 * @returns Formatted date string or "Invalid date" if parsing fails
 */
export const formatDate = (
  date: DateInput,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const parsed = parseDate(date);
  if (!parsed) return 'Invalid date';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    // Don't specify timeZone - let it use the system default (local timezone)
  };

  return new Intl.DateTimeFormat('en-US', {
    ...defaultOptions,
    ...options,
  }).format(parsed);
};

/**
 * Calculate human-readable time difference from now
 * @param date - ISO date string or Date object
 * @returns Human-readable time difference (e.g., "2 hours ago")
 */
export const calculateTimeDiff = (date: DateInput): string => {
  const parsed = parseDate(date);
  if (!parsed) return 'Unknown';

  // Get current time
  const now = new Date();

  // Calculate difference in milliseconds
  // Use getTime() to ensure we're comparing epoch timestamps correctly
  const diffMs = now.getTime() - parsed.getTime();

  // Handle negative differences (future dates)
  if (diffMs < 0) {
    return 'In the future';
  }

  // Calculate time units
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  }
  if (diffWeeks > 0) {
    return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  }
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  }

  return 'Just now';
};

/**
 * Format date with time only
 * @param date - ISO date string or Date object
 * @returns Time string (e.g., "3:45 PM")
 */
export const formatTime = (date: DateInput): string => {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Format date with date only
 * @param date - ISO date string or Date object
 * @returns Date string (e.g., "Oct 18, 2025")
 */
export const formatDateOnly = (date: DateInput): string => {
  return formatDate(date, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Get relative date string for display
 * Shows formatted date if older than 7 days, otherwise shows time ago
 * @param date - ISO date string or Date object
 * @returns Formatted or relative date string
 */
export const getRelativeDate = (date: DateInput): string => {
  const parsed = parseDate(date);
  if (!parsed) return 'Unknown';

  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Show time ago if within last 7 days
  if (diffDays <= 7) {
    return calculateTimeDiff(date);
  }

  // Show formatted date for older dates
  return formatDateOnly(date);
};

/**
 * Default export with all date utility functions
 */
export default {
  parseDate,
  formatDate,
  formatTime,
  formatDateOnly,
  calculateTimeDiff,
  getRelativeDate,
};
