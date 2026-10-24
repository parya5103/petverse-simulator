// Tiny event bus. Modules communicate through events, never direct imports.

export function createBus() {
  const listeners = new Map();

  function on(event, fn) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(fn);
    return function off() {
      const set = listeners.get(event);
      if (set) set.delete(fn);
    };
  }

  function emit(event, payload) {
    const set = listeners.get(event);
    if (!set) return;
    for (const fn of set) fn(payload);
  }

  return { on, emit };
}
