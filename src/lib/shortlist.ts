"use client";

import { create } from "zustand";

/**
 * Shortlist — up to five units (§9.2).
 *
 * §5 forbids depending on localStorage. The store is in memory and works
 * fully without it; persistence is an enhancement layered on top, and every
 * access is guarded so a private window, a blocked-storage browser or a
 * quota error degrades to an in-memory shortlist rather than a broken page.
 */

export const SHORTLIST_LIMIT = 5;
const KEY = "sunpure.shortlist.v1";

export type ShortlistEntry = {
  slug: string;
  unitId: string;
  /** Carried so the tray can name a project from another page without a lookup. */
  projectName: string;
};

type ShortlistState = {
  entries: ShortlistEntry[];
  hydrated: boolean;
  toggle: (entry: ShortlistEntry) => void;
  remove: (entry: ShortlistEntry) => void;
  clear: () => void;
  hydrate: () => void;
};

const same = (a: ShortlistEntry, b: ShortlistEntry) =>
  a.slug === b.slug && a.unitId === b.unitId;

function persist(entries: ShortlistEntry[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // Storage unavailable or full. The in-memory shortlist still works.
  }
}

function restore(): ShortlistEntry[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is ShortlistEntry =>
          typeof e === "object" &&
          e !== null &&
          typeof (e as ShortlistEntry).slug === "string" &&
          typeof (e as ShortlistEntry).unitId === "string" &&
          typeof (e as ShortlistEntry).projectName === "string",
      )
      .slice(0, SHORTLIST_LIMIT);
  } catch {
    return [];
  }
}

export const useShortlist = create<ShortlistState>((set, get) => ({
  entries: [],
  hydrated: false,

  toggle: (entry) => {
    const { entries } = get();
    const exists = entries.some((e) => same(e, entry));
    const next = exists
      ? entries.filter((e) => !same(e, entry))
      : entries.length >= SHORTLIST_LIMIT
        ? entries
        : [...entries, entry];
    if (next === entries) return;
    set({ entries: next });
    persist(next);
  },

  remove: (entry) => {
    const next = get().entries.filter((e) => !same(e, entry));
    set({ entries: next });
    persist(next);
  },

  clear: () => {
    set({ entries: [] });
    persist([]);
  },

  /** Called once from a mount effect, so server and first client render agree. */
  hydrate: () => {
    if (get().hydrated) return;
    set({ entries: restore(), hydrated: true });
  },
}));

export function isShortlisted(entries: ShortlistEntry[], entry: ShortlistEntry) {
  return entries.some((e) => same(e, entry));
}
