/**
 * Zustand store for Project Focus (multi-select filtering).
 * 
 * Projects as focus lenses, not tabs. Users can focus on 0, 1, or many projects
 * simultaneously, and all views filter by the focused projects.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FocusState {
  // Set of focused project IDs (empty = show all)
  focusedProjectIds: Set<string>;
  
  // Actions
  toggleFocus: (projectId: string) => void;
  setFocus: (projectIds: string[]) => void;
  clearFocus: () => void;
  isFocused: (projectId: string) => boolean;
  
  // Computed
  hasFocus: () => boolean;
  focusCount: () => number;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      focusedProjectIds: new Set<string>(),

      toggleFocus: (projectId: string) => {
        set((state) => {
          const newSet = new Set(state.focusedProjectIds);
          if (newSet.has(projectId)) {
            newSet.delete(projectId);
          } else {
            newSet.add(projectId);
          }
          return { focusedProjectIds: newSet };
        });
      },

      setFocus: (projectIds: string[]) => {
        set({ focusedProjectIds: new Set(projectIds) });
      },

      clearFocus: () => {
        set({ focusedProjectIds: new Set() });
      },

      isFocused: (projectId: string) => {
        return get().focusedProjectIds.has(projectId);
      },

      hasFocus: () => {
        return get().focusedProjectIds.size > 0;
      },

      focusCount: () => {
        return get().focusedProjectIds.size;
      },
    }),
    {
      name: 'cc-focus-state',
      // Custom serialization for Set
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              focusedProjectIds: new Set(parsed.state.focusedProjectIds || []),
            },
          };
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              focusedProjectIds: Array.from(value.state.focusedProjectIds),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

/**
 * Hook to get focused project IDs as an array.
 * Useful for API calls and filtering.
 */
export const useFocusedProjects = (): string[] => {
  const focusedProjectIds = useFocusStore((state) => state.focusedProjectIds);
  return Array.from(focusedProjectIds);
};

/**
 * Hook to check if data should be shown based on focus.
 * Returns true if:
 * - No focus is set (show everything)
 * - The item's project is in the focused set
 */
export const useIsInFocus = (projectId: string | null | undefined): boolean => {
  const focusedProjectIds = useFocusStore((state) => state.focusedProjectIds);
  
  // If no focus set, everything is "in focus"
  if (focusedProjectIds.size === 0) return true;
  
  // If item has no project, show it (global items)
  if (!projectId) return true;
  
  // Check if item's project is focused
  return focusedProjectIds.has(projectId);
};
