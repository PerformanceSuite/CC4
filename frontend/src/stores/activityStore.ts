/**
 * Activity Store - Tracks AI activity for the Living Orb indicator.
 *
 * The orb glows when there's been recent AI activity (within IDLE_TIMEOUT).
 */

import { create } from 'zustand';

const IDLE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

interface ActivityState {
  lastActivityTime: number;
  isActive: boolean;

  // Actions
  recordActivity: () => void;
  checkActivity: () => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  lastActivityTime: Date.now(), // Start as active
  isActive: true,

  recordActivity: () => {
    set({
      lastActivityTime: Date.now(),
      isActive: true,
    });
  },

  checkActivity: () => {
    const { lastActivityTime } = get();
    const elapsed = Date.now() - lastActivityTime;
    set({ isActive: elapsed < IDLE_TIMEOUT_MS });
  },
}));

// Helper to wrap fetch calls and record activity
export async function fetchWithActivity<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  useActivityStore.getState().recordActivity();
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

// Start a background timer to check activity status
if (typeof window !== 'undefined') {
  setInterval(() => {
    useActivityStore.getState().checkActivity();
  }, 10000); // Check every 10 seconds
}
