/**
 * Custom React Hooks Type Definitions
 * Type definitions for custom hooks used throughout the application
 */

import type { DependencyList } from 'react';
import type { AnalysisConfig, AnalysisResults } from './views.types';

// ============ ASYNC OPERATION HOOKS ============

/**
 * Async state hook result
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

/**
 * Async operation options
 */
export interface AsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

// ============ DATA FETCHING HOOKS ============

/**
 * Use fetch result
 */
export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch options
 */
export interface FetchOptions {
  immediate?: boolean;
  dependencies?: DependencyList;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

// ============ FORM HOOKS ============

/**
 * Form field state
 */
export interface FormFieldState<T = string> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

/**
 * Form state
 */
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

/**
 * Form actions
 */
export interface FormActions<T> {
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  setTouched: <K extends keyof T>(field: K, touched: boolean) => void;
  reset: (values?: T) => void;
  submit: () => Promise<void>;
}

/**
 * Use form result
 */
export interface UseFormResult<T> {
  state: FormState<T>;
  actions: FormActions<T>;
  register: <K extends keyof T>(field: K) => FormFieldRegistration<T[K]>;
}

/**
 * Form field registration
 */
export interface FormFieldRegistration<T> {
  value: T;
  onChange: (value: T) => void;
  onBlur: () => void;
  error?: string;
}

/**
 * Form validation rules
 */
export interface ValidationRules<T> {
  [K: string]: ValidationRule<T> | ValidationRule<T>[];
}

/**
 * Single validation rule
 */
export type ValidationRule<T> = (value: any, values: T) => string | null | Promise<string | null>;

/**
 * Form options
 */
export interface FormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// ============ STORAGE HOOKS ============

/**
 * Local storage hook result
 */
export interface UseLocalStorageResult<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

/**
 * Session storage hook result
 */
export interface UseSessionStorageResult<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

// ============ ELECTRON API HOOKS ============

/**
 * Use IPC result for queries
 */
export interface UseIPCQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Use IPC mutation result
 */
export interface UseIPCMutationResult<TArgs extends any[], TResult> {
  mutate: (...args: TArgs) => Promise<TResult>;
  data: TResult | null;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}

// ============ ANALYSIS HOOKS ============

/**
 * Use analysis result
 */
export interface UseAnalysisResult {
  analyze: (config: AnalysisConfig) => Promise<void>;
  results: AnalysisResults | null;
  progress: number;
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  error: Error | null;
  cancel: () => void;
}

/**
 * Use recommendations result
 */
export interface UseRecommendationsResult {
  recommendations: Recommendation[];
  loading: boolean;
  error: Error | null;
  updateStatus: (id: number, status: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Recommendation item (re-export for convenience)
 */
export interface Recommendation {
  id: number;
  rec_id: string;
  rule_id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description?: string;
  effort: 'quick' | 'medium' | 'complex';
  estimated_time?: string;
  score_increase?: number;
  percentage_increase?: number;
  status: 'pending' | 'in-progress' | 'completed' | 'dismissed';
}

// ============ DEBOUNCE/THROTTLE HOOKS ============

/**
 * Debounced value result
 */
export interface UseDebouncedValueResult<T> {
  debouncedValue: T;
  isPending: boolean;
}

/**
 * Debounced callback options
 */
export interface DebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

/**
 * Throttle options
 */
export interface ThrottleOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
}

// ============ MEDIA QUERY HOOKS ============

/**
 * Media query result
 */
export interface UseMediaQueryResult {
  matches: boolean;
}

/**
 * Breakpoint values
 */
export interface Breakpoints {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
}

/**
 * Use breakpoints result
 */
export interface UseBreakpointsResult extends Breakpoints {
  current: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// ============ PAGINATION HOOKS ============

/**
 * Pagination state
 */
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Pagination actions
 */
export interface PaginationActions {
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  reset: () => void;
}

/**
 * Use pagination result
 */
export interface UsePaginationResult {
  state: PaginationState;
  actions: PaginationActions;
  canGoNext: boolean;
  canGoPrev: boolean;
}

// ============ SELECTION HOOKS ============

/**
 * Selection state
 */
export interface SelectionState<T> {
  selectedItems: T[];
  isSelected: (item: T) => boolean;
  isAllSelected: boolean;
  isSomeSelected: boolean;
}

/**
 * Selection actions
 */
export interface SelectionActions<T> {
  select: (item: T) => void;
  deselect: (item: T) => void;
  toggle: (item: T) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleAll: () => void;
}

/**
 * Use selection result
 */
export interface UseSelectionResult<T> {
  state: SelectionState<T>;
  actions: SelectionActions<T>;
}

// ============ WINDOW/DOCUMENT HOOKS ============

/**
 * Window size
 */
export interface WindowSize {
  width: number;
  height: number;
}

/**
 * Scroll position
 */
export interface ScrollPosition {
  x: number;
  y: number;
}

/**
 * Mouse position
 */
export interface MousePosition {
  x: number;
  y: number;
}

// ============ CLIPBOARD HOOKS ============

/**
 * Use clipboard result
 */
export interface UseClipboardResult {
  copied: boolean;
  copy: (text: string) => Promise<void>;
  error: Error | null;
}

// ============ INTERVAL/TIMEOUT HOOKS ============

/**
 * Use interval result
 */
export interface UseIntervalResult {
  start: () => void;
  stop: () => void;
  isRunning: boolean;
}

/**
 * Use timeout result
 */
export interface UseTimeoutResult {
  start: () => void;
  stop: () => void;
  reset: () => void;
  isRunning: boolean;
}

// ============ TOGGLE HOOKS ============

/**
 * Use toggle result
 */
export interface UseToggleResult {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: (value: boolean) => void;
}

// ============ PREVIOUS VALUE HOOK ============

/**
 * Previous value (for comparison in effects)
 */
export type UsePreviousResult<T> = T | undefined;
