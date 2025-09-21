import '@testing-library/jest-dom';

// Mock IndexedDB
global.indexedDB = require('fake-indexeddb');
global.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

// Mock Service Worker
global.navigator.serviceWorker = {
  register: jest.fn(() => Promise.resolve()),
};

// Mock Crypto API
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random(),
  },
});

// Mock intersection observer
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};