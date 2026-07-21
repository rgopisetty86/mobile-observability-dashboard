import '@testing-library/jest-dom'
import { vi } from 'vitest'

// ── Firebase mock ─────────────────────────────────────────────────────────
// Prevents real Firebase SDK from initialising during tests.
vi.mock('../lib/firebase', () => ({
  db:           {},
  isConfigured: false,
}))

// ── Datadog mock ──────────────────────────────────────────────────────────
// Preserve real helper implementations; only stub isDatadogConfigured + queryMetrics
vi.mock('../lib/datadog', async (importActual) => {
  const actual = await importActual<typeof import('../lib/datadog')>()
  return {
    ...actual,
    isDatadogConfigured: false,
    queryMetrics:        vi.fn().mockResolvedValue(null),
  }
})

// ── Firestore mock ────────────────────────────────────────────────────────
vi.mock('firebase/firestore', () => ({
  doc:             vi.fn(),
  collection:      vi.fn(),
  onSnapshot:      vi.fn(() => vi.fn()), // returns unsubscribe fn
  query:           vi.fn(),
  orderBy:         vi.fn(),
  setDoc:          vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn().mockReturnValue('__serverTimestamp__'),
}))

// ── ResizeObserver mock (required by Recharts) ────────────────────────────
global.ResizeObserver = class ResizeObserver {
  observe()    {}
  unobserve()  {}
  disconnect() {}
}

// ── matchMedia mock (required by useDarkMode) ─────────────────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches:              false,
    media:                query,
    onchange:             null,
    addListener:          vi.fn(),
    removeListener:       vi.fn(),
    addEventListener:     vi.fn(),
    removeEventListener:  vi.fn(),
    dispatchEvent:        vi.fn(),
  })),
})

// ── scrollIntoView mock ───────────────────────────────────────────────────
window.HTMLElement.prototype.scrollIntoView = vi.fn()
