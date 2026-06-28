# Debug Session: tooltip-useref-null

- Status: OPEN
- Symptom: Browser runtime error `TypeError: Cannot read properties of null (reading 'useRef')`
- Suspected area: React bootstrap / Radix tooltip provider / Vite dependency loading

## Hypotheses

1. Two React instances are loaded, so Radix reads a different hook dispatcher.
2. The local tooltip wrapper exports or composes `TooltipProvider` incorrectly.
3. Vite prebundled dependencies are stale and React-related modules are out of sync.
4. App bootstrap order causes a provider to render before React dispatcher initialization.
5. React and ReactDOM runtime state diverge during hot reload, causing a null dispatcher.

## Evidence Log

- Pending instrumentation.

## Next Step

- Inspect bootstrap path and add runtime instrumentation only.
