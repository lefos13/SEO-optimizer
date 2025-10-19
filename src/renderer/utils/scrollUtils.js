/**
 * Scroll utilities for smooth navigation within the application
 */

/**
 * Smoothly scrolls to the results card element
 * @param {string} className - The CSS class name of the element to scroll to (default: 'results-card')
 * @param {Object} options - Scroll options
 * @param {number} options.offset - Offset from the top in pixels (default: 20)
 * @param {string} options.behavior - Scroll behavior ('smooth' or 'auto', default: 'smooth')
 */
export const scrollToResults = (className = 'results-card', options = {}) => {
  const { offset = 20, behavior = 'smooth' } = options;

  // Use setTimeout to ensure the DOM has updated with the results
  setTimeout(() => {
    const resultsElement = document.querySelector(`.${className}`);
    console.log(`Searching for element ${className}, found:`, resultsElement);

    if (resultsElement) {
      // Find the scrollable container (.content-wrapper) instead of scrolling the window
      const scrollContainer =
        document.querySelector('.content-wrapper') || window;

      const elementPosition = resultsElement.getBoundingClientRect().top;
      const containerRect =
        scrollContainer === window
          ? { top: 0 }
          : scrollContainer.getBoundingClientRect();
      const offsetPosition =
        elementPosition -
        containerRect.top +
        (scrollContainer === window
          ? window.pageYOffset
          : scrollContainer.scrollTop) -
        offset;

      if (scrollContainer === window) {
        window.scrollTo({
          top: offsetPosition,
          behavior: behavior,
        });
      } else {
        scrollContainer.scrollTo({
          top: offsetPosition,
          behavior: behavior,
        });
      }
      console.log(
        'Scrolling to className:',
        className,
        'in container:',
        scrollContainer === window ? 'window' : scrollContainer.className
      );
    }
  }, 100); // Small delay to ensure DOM update
};

/**
 * Scrolls to an element by its ID
 * @param {string} elementId - The ID of the element to scroll to
 * @param {Object} options - Scroll options
 * @param {number} options.offset - Offset from the top in pixels (default: 20)
 * @param {string} options.behavior - Scroll behavior ('smooth' or 'auto', default: 'smooth')
 */
export const scrollToElement = (elementId, options = {}) => {
  const { offset = 20, behavior = 'smooth' } = options;

  setTimeout(() => {
    const element = document.getElementById(elementId);

    if (element) {
      // Find the scrollable container (.content-wrapper) instead of scrolling the window
      const scrollContainer =
        document.querySelector('.content-wrapper') || window;

      const elementPosition = element.getBoundingClientRect().top;
      const containerRect =
        scrollContainer === window
          ? { top: 0 }
          : scrollContainer.getBoundingClientRect();
      const offsetPosition =
        elementPosition -
        containerRect.top +
        (scrollContainer === window
          ? window.pageYOffset
          : scrollContainer.scrollTop) -
        offset;

      if (scrollContainer === window) {
        window.scrollTo({
          top: offsetPosition,
          behavior: behavior,
        });
      } else {
        scrollContainer.scrollTo({
          top: offsetPosition,
          behavior: behavior,
        });
      }
    }
  }, 100);
};
