/**
 * Zustand store for Projects and Active Documents.
 */

import { create } from 'zustand';
import { projectsApi, Project, ActiveDocument, TokenBudget } from '../api/client';

interface ProjectsState {
  // Data
  projects: Project[];
  activeProject: Project | null;
  documents: ActiveDocument[];
  tokenBudget: TokenBudget | null;

  // Loading states
  isLoading: boolean;
  isLoadingDocuments: boolean;
  error: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  fetchActiveProject: () => Promise<void>;
  setActiveProject: (projectId: string) => Promise<void>;
  createProject: (data: { name: string; slug: string; description?: string; repo_path?: string }) => Promise<Project>;

  // Document actions
  fetchDocuments: () => Promise<void>;
  pinDocument: (path: string) => Promise<void>;
  unpinDocument: (docId: string) => Promise<void>;
  refreshDocument: (docId: string) => Promise<void>;
  fetchTokenBudget: () => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  // Initial state
  projects: [],
  activeProject: null,
  documents: [],
  tokenBudget: null,
  isLoading: false,
  isLoadingDocuments: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await projectsApi.list();
      set({
        projects: data.projects,
        activeProject: data.active_project,
        isLoading: false,
      });
      // Also fetch documents if we have an active project
      if (data.active_project) {
        await get().fetchDocuments();
      }
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchActiveProject: async () => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.getActive();
      set({ activeProject: project, isLoading: false });
      // Fetch documents for active project
      await get().fetchDocuments();
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  setActiveProject: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.activate(projectId);
      set((state) => ({
        activeProject: project,
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, is_active: true } : { ...p, is_active: false }
        ),
        isLoading: false,
      }));
      // Fetch documents for new active project
      await get().fetchDocuments();
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.create(data);
      set((state) => ({
        projects: [project, ...state.projects],
        isLoading: false,
      }));
      return project;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  fetchDocuments: async () => {
    const { activeProject } = get();
    if (!activeProject) return;

    set({ isLoadingDocuments: true });
    try {
      const [docs, budget] = await Promise.all([
        projectsApi.listDocuments(activeProject.id),
        projectsApi.getTokenBudget(activeProject.id),
      ]);
      set({ documents: docs, tokenBudget: budget, isLoadingDocuments: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoadingDocuments: false });
    }
  },

  pinDocument: async (path: string) => {
    const { activeProject } = get();
    if (!activeProject) return;

    try {
      const doc = await projectsApi.pinDocument(activeProject.id, path);
      set((state) => ({
        documents: [doc, ...state.documents],
      }));
      // Refresh budget
      await get().fetchTokenBudget();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  unpinDocument: async (docId: string) => {
    const { activeProject } = get();
    if (!activeProject) return;

    try {
      await projectsApi.unpinDocument(activeProject.id, docId);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== docId),
      }));
      // Refresh budget
      await get().fetchTokenBudget();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  refreshDocument: async (docId: string) => {
    const { activeProject } = get();
    if (!activeProject) return;

    try {
      const doc = await projectsApi.refreshDocument(activeProject.id, docId);
      set((state) => ({
        documents: state.documents.map((d) => (d.id === docId ? doc : d)),
      }));
      // Refresh budget
      await get().fetchTokenBudget();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  fetchTokenBudget: async () => {
    const { activeProject } = get();
    if (!activeProject) return;

    try {
      const budget = await projectsApi.getTokenBudget(activeProject.id);
      set({ tokenBudget: budget });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
