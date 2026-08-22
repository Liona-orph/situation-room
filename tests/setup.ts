import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest 3 cannot install jsdom's Storage implementation on Node 25+ because
// Node reserves the same configurable globals. Keep the test environment
// deterministic until the upstream fix is available on this release line.
const runtime = globalThis as typeof globalThis & {
  process?: { versions?: { node?: string } };
};

if (Number(runtime.process?.versions?.node?.split(".")[0] ?? 0) >= 25) {
  const values = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });
}

afterEach(() => {
  cleanup();
});
