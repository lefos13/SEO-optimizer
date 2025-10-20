// Jest setup: attach global window mocks or helpers
// Provide TextEncoder/TextDecoder polyfills for node environments (used by some libs)
import util from 'util';

try {
  if (
    typeof (global as unknown as Record<string, unknown>).TextEncoder ===
    'undefined'
  ) {
    (global as unknown as Record<string, unknown>).TextEncoder =
      util.TextEncoder;
  }
  if (
    typeof (global as unknown as Record<string, unknown>).TextDecoder ===
    'undefined'
  ) {
    (global as unknown as Record<string, unknown>).TextDecoder =
      util.TextDecoder;
  }
} catch (_e) {
  // ignore if util not available
}

import '@testing-library/jest-dom';

// Provide a minimal global window if missing
if (typeof global.window === 'undefined') {
  // @ts-expect-error: augment global.window for test environment
  global.window = {};
}

// Attach electronAPI mock if exists
try {
  // Dynamically import mock to avoid require-style imports
  import('./__mocks__/electronAPI')
    .then(mod => {
      (global as unknown as { window: Record<string, unknown> }).window =
        (global as unknown as { window: Record<string, unknown> }).window || {};
      (
        (global as unknown as { window: Record<string, unknown> })
          .window as Record<string, unknown>
      ).electronAPI = mod.default;
    })
    .catch(_err => {
      // Ignore if mock not present
    });
} catch (_err) {
  // Ignore if dynamic import fails synchronously
}
