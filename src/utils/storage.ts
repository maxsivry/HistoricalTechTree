// Safe JSON localStorage helpers with namespacing
const NAMESPACE = "htt"; // historical-tech-tree

const ns = (key: string) => `${NAMESPACE}.${key}`;

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(ns(key));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ns(key), JSON.stringify(value));
  } catch {
    // ignore write failures
  }
}

