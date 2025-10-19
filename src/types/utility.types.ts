/**
 * Utility Type Definitions
 * Common utility types and helper types used across the application
 */

// ============================================================
// Common Types
// ============================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, never>>;
  }[Keys];

// ============================================================
// Async Types
// ============================================================

export type AsyncFunction<T = any, R = any> = (arg: T) => Promise<R>;

export type PromiseValue<T> = T extends Promise<infer U> ? U : T;

export interface AsyncState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

// ============================================================
// Result Types
// ============================================================

export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export type SuccessResult<T> = { success: true; data: T };
export type ErrorResult<E = Error> = { success: false; error: E };

// ============================================================
// Validation Types
// ============================================================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export type Validator<T> = (value: T) => ValidationResult;

// ============================================================
// Event Types
// ============================================================

export interface EventHandler<T = any> {
  (event: T): void | Promise<void>;
}

export interface EventMap {
  [event: string]: any;
}

export interface TypedEventEmitter<Events extends EventMap> {
  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void;
  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void;
  emit<K extends keyof Events>(event: K, data: Events[K]): void;
}

// ============================================================
// Date/Time Types
// ============================================================

export type DateString = string; // ISO 8601 format
export type Timestamp = number; // Unix timestamp in milliseconds

export interface DateRange {
  start: Date | DateString;
  end: Date | DateString;
}

export interface TimeRange {
  start: Timestamp;
  end: Timestamp;
}

// ============================================================
// Pagination Types
// ============================================================

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

// ============================================================
// Sorting Types
// ============================================================

export type SortDirection = 'asc' | 'desc' | 'ASC' | 'DESC';

export interface SortParams<T = string> {
  field: T;
  direction: SortDirection;
}

export interface SortableColumn<T = string> {
  field: T;
  label: string;
  sortable: boolean;
}

// ============================================================
// Filter Types
// ============================================================

export type FilterOperator = 
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'in'
  | 'notIn'
  | 'between'
  | 'isNull'
  | 'isNotNull';

export interface Filter<T = any> {
  field: string;
  operator: FilterOperator;
  value: T;
}

export interface FilterGroup {
  operator: 'AND' | 'OR';
  filters: (Filter | FilterGroup)[];
}

// ============================================================
// ID Types
// ============================================================

export type ID = string | number;
export type UUID = string;

// ============================================================
// Color Types
// ============================================================

export type HexColor = string; // #RRGGBB or #RRGGBBAA
export type RGBColor = { r: number; g: number; b: number };
export type RGBAColor = { r: number; g: number; b: number; a: number };

// ============================================================
// File Types
// ============================================================

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface FileWithContent extends FileMetadata {
  content: string | ArrayBuffer;
}

// ============================================================
// Error Types
// ============================================================

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

export interface ApiError extends ErrorInfo {
  statusCode: number;
}

// ============================================================
// Configuration Types
// ============================================================

export interface Config {
  [key: string]: any;
}

export type Environment = 'development' | 'production' | 'test';

// ============================================================
// Branding Types
// ============================================================

export type Brand<K, T> = K & { __brand: T };

// Example usage:
// type UserId = Brand<number, 'UserId'>;
// type ProjectId = Brand<number, 'ProjectId'>;

// ============================================================
// Function Utility Types
// ============================================================

export type VoidFunction = () => void;
export type AsyncVoidFunction = () => Promise<void>;

export type Callback<T = void> = (result: T) => void;
export type ErrorCallback = (error: Error) => void;
export type NodeCallback<T = any> = (error: Error | null, result?: T) => void;

// ============================================================
// Object Utility Types
// ============================================================

export type KeyOf<T> = keyof T;
export type ValueOf<T> = T[keyof T];

export type PickByValue<T, V> = Pick<T, {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T]>;

export type OmitByValue<T, V> = Pick<T, {
  [K in keyof T]: T[K] extends V ? never : K;
}[keyof T]>;
