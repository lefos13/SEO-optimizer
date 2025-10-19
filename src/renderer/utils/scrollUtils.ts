/// <reference lib="dom" />

/**
 * Scroll utilities for smooth navigation within the application
 */

/**
 * Scroll behavior options
 */
export type ScrollBehavior = 'smooth' | 'auto';

/**
 * Options for scroll functions
 */
export interface ScrollOptions {
  /** Offset from the top in pixels (default: 20) */
  offset?: number;
  /** Scroll behavior ('smooth' or 'auto', default: 'smooth') */
  behavior?: ScrollBehavior;
}

/**
 * Type guard to check if an element is a scrollable element
 */
function isElement(element: Element | Window): element is Element {
  return (
    element !== window &&
    'getBoundingClientRect' in element &&
    'scrollTo' in element
  );
}

/**
 * Smoothly scrolls to the results card element
 * @param className - The CSS class name of the element to scroll to (default: 'results-card')
 * @param options - Scroll options
 */
export const scrollToResults = (
  className: string = 'results-card',
  options: ScrollOptions = {}
): void => {
  const { offset = 20, behavior = 'smooth' } = options;

  // Use setTimeout to ensure the DOM has updated with the results
  setTimeout(() => {
    const resultsElement = document.querySelector(`.${className}`);
    console.log(`Searching for element ${className}, found:`, resultsElement);

    if (resultsElement) {
      // Find the scrollable container (.content-wrapper) instead of scrolling the window
      const scrollContainerElement = document.querySelector('.content-wrapper');
      const scrollContainer: Element | Window =
        scrollContainerElement || window;

      const elementPosition = resultsElement.getBoundingClientRect().top;
      const containerRect: { top: number } =
        scrollContainer === window
          ? { top: 0 }
          : (scrollContainer as Element).getBoundingClientRect();
      const offsetPosition =
        elementPosition -
        containerRect.top +
        (scrollContainer === window
          ? window.pageYOffset
          : (scrollContainer as Element).scrollTop) -
        offset;

      if (scrollContainer === window) {
        window.scrollTo({
          top: offsetPosition,
          behavior: behavior,
        });
      } else if (isElement(scrollContainer)) {
        scrollContainer.scrollTo({
          top: offsetPosition,
          behavior: behavior,
        });
      }
      console.log(
        'Scrolling to className:',
        className,
        'in container:',
        scrollContainer === window
          ? 'window'
          : (scrollContainer as Element).className
      );
    }
  }, 100); // Small delay to ensure DOM update
};

/**
 * Scrolls to an element by its ID
 * @param elementId - The ID of the element to scroll to
 * @param options - Scroll options
 */
export const scrollToElement = (
  elementId: string,
  options: ScrollOptions = {}
): void => {
  const { offset = 20, behavior = 'smooth' } = options;

  setTimeout(() => {
    const element = document.getElementById(elementId);

    if (element) {
      // Find the scrollable container (.content-wrapper) instead of scrolling the window
      const scrollContainerElement = document.querySelector('.content-wrapper');
      const scrollContainer: Element | Window =
        scrollContainerElement || window;

      const elementPosition = element.getBoundingClientRect().top;
      const containerRect: { top: number } =
        scrollContainer === window
          ? { top: 0 }
          : (scrollContainer as Element).getBoundingClientRect();
      const offsetPosition =
        elementPosition -
        containerRect.top +
        (scrollContainer === window
          ? window.pageYOffset
          : (scrollContainer as Element).scrollTop) -
        offset;

      if (scrollContainer === window) {
        window.scrollTo({
          top: offsetPosition,
          behavior: behavior,
        });
      } else if (isElement(scrollContainer)) {
        scrollContainer.scrollTo({
          top: offsetPosition,
          behavior: behavior,
        });
      }
    }
  }, 100);
};
