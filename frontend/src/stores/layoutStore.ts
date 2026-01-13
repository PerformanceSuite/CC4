/**
 * Layout Store - Manages panel layout configuration and persistence.
 *
 * Supports:
 * - Docked panels (left, right, bottom, tabs)
 * - Floating panels (draggable windows)
 * - Maximized panels (full workspace)
 * - Layout presets (discovery, execution, strategic, minimal)
 * - User preferences persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PanelId =
  | 'vislzr'
  | 'flow-board'
  | 'cli-chat'
  | 'agent-activity'
  | 'document-inbox'
  | 'revenue-dashboard';

export type LayoutPreset = 'discovery' | 'execution' | 'strategic' | 'minimal';

export interface PanelState {
  id: PanelId;
  isVisible: boolean;
  isFloating: boolean;
  isMaximized: boolean;
  position?: { x: number; y: number }; // For floating panels
  size?: { width: number; height: number }; // For floating panels
}

interface LayoutState {
  panels: Record<PanelId, PanelState>;
  activePreset: LayoutPreset | null;

  // Actions
  showPanel: (id: PanelId) => void;
  hidePanel: (id: PanelId) => void;
  togglePanel: (id: PanelId) => void;
  floatPanel: (id: PanelId, position?: { x: number; y: number }) => void;
  dockPanel: (id: PanelId) => void;
  maximizePanel: (id: PanelId) => void;
  restorePanel: (id: PanelId) => void;
  updatePanelPosition: (id: PanelId, position: { x: number; y: number }) => void;
  updatePanelSize: (id: PanelId, size: { width: number; height: number }) => void;
  loadPreset: (preset: LayoutPreset) => void;
  resetLayout: () => void;
}

// Layout presets from spec
const LAYOUT_PRESETS: Record<LayoutPreset, PanelId[]> = {
  discovery: ['document-inbox', 'vislzr', 'cli-chat'],
  execution: ['flow-board', 'agent-activity', 'cli-chat'],
  strategic: ['revenue-dashboard', 'vislzr', 'flow-board'],
  minimal: ['vislzr'],
};

// Default panel states
const createDefaultPanelState = (id: PanelId): PanelState => ({
  id,
  isVisible: false,
  isFloating: false,
  isMaximized: false,
});

const defaultPanels: Record<PanelId, PanelState> = {
  vislzr: createDefaultPanelState('vislzr'),
  'flow-board': createDefaultPanelState('flow-board'),
  'cli-chat': createDefaultPanelState('cli-chat'),
  'agent-activity': createDefaultPanelState('agent-activity'),
  'document-inbox': createDefaultPanelState('document-inbox'),
  'revenue-dashboard': createDefaultPanelState('revenue-dashboard'),
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      panels: defaultPanels,
      activePreset: null,

      showPanel: (id) =>
        set((state) => ({
          panels: {
            ...state.panels,
            [id]: { ...state.panels[id], isVisible: true },
          },
        })),

      hidePanel: (id) =>
        set((state) => ({
          panels: {
            ...state.panels,
            [id]: { ...state.panels[id], isVisible: false, isMaximized: false },
          },
        })),

      togglePanel: (id) => {
        const { panels } = get();
        const isVisible = panels[id].isVisible;
        if (isVisible) {
          get().hidePanel(id);
        } else {
          get().showPanel(id);
        }
      },

      floatPanel: (id, position) =>
        set((state) => ({
          panels: {
            ...state.panels,
            [id]: {
              ...state.panels[id],
              isFloating: true,
              isMaximized: false,
              position: position || { x: 100, y: 100 },
              size: state.panels[id].size || { width: 600, height: 400 },
            },
          },
        })),

      dockPanel: (id) =>
        set((state) => ({
          panels: {
            ...state.panels,
            [id]: {
              ...state.panels[id],
              isFloating: false,
              isMaximized: false,
              position: undefined,
              size: undefined,
            },
          },
        })),

      maximizePanel: (id) =>
        set((state) => ({
          panels: {
            ...state.panels,
            [id]: { ...state.panels[id], isMaximized: true },
          },
        })),

      restorePanel: (id) =>
        set((state) => ({
          panels: {
            ...state.panels,
            [id]: { ...state.panels[id], isMaximized: false },
          },
        })),

      updatePanelPosition: (id, position) =>
        set((state) => ({
          panels: {
            ...state.panels,
            [id]: { ...state.panels[id], position },
          },
        })),

      updatePanelSize: (id, size) =>
        set((state) => ({
          panels: {
            ...state.panels,
            [id]: { ...state.panels[id], size },
          },
        })),

      loadPreset: (preset) => {
        const panelIds = LAYOUT_PRESETS[preset];
        const newPanels = { ...defaultPanels };

        // Show only panels in the preset
        panelIds.forEach((id) => {
          newPanels[id] = { ...newPanels[id], isVisible: true };
        });

        set({ panels: newPanels, activePreset: preset });
      },

      resetLayout: () => set({ panels: defaultPanels, activePreset: null }),
    }),
    {
      name: 'layout-storage',
    }
  )
);
