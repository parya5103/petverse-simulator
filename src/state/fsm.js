// Minimal finite state machine: 'idle' or 'acting'.
// Prevents overlapping actions (e.g. feeding mid-hop animation).

export function createFsm(bus, initial = 'idle') {
  let current = initial;

  function is(s) {
    return current === s;
  }

  function can() {
    return current === 'idle';
  }

  function to(next) {
    if (next === current) return false;
    const prev = current;
    current = next;
    if (bus) bus.emit('fsm-change', { from: prev, to: next });
    return true;
  }

  return { is, can, to, get state() { return current; } };
}
