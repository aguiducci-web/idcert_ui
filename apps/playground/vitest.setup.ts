import '@testing-library/jest-dom/vitest'

// jsdom does not implement ResizeObserver; cmdk (via Radix) needs it.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

// jsdom does not implement Element.scrollIntoView; cmdk calls it on the active item.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () {}
}
