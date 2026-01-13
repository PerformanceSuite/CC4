/**
 * Zustand store for Ideas UI state.
 */

import { create } from 'zustand';
import type { RecentIdea } from '../components/Ideas/RecentIdeas';

// API response types
interface ExecuteIdeaResponse {
  idea_id: string;
  session_id: string;
  status: string;
}

interface ValidateIdeaResponse {
  idea_id: string;
  status: string;
  confidence: number;
  hypotheses: unknown[];
  recommendation: string;
  summary: string;
}

interface PlanIdeaResponse {
  idea_id: string;
  plan: unknown;
}

interface IdeasState {
  // Recent ideas
  ideas: RecentIdea[];
  isLoading: boolean;
  error: string | null;

  // Selected idea for detail view
  selectedIdea: RecentIdea | null;

  // Actions
  fetchIdeas: () => Promise<void>;
  submitIdea: (data: {
    input: string;
    action: 'validate' | 'plan' | 'execute';
    project_id?: string;
    require_review?: boolean;
    run_e2e_tests?: boolean;
  }) => Promise<ExecuteIdeaResponse | ValidateIdeaResponse | PlanIdeaResponse>;
  cancelIdea: (ideaId: string) => Promise<void>;
  selectIdea: (idea: RecentIdea | null) => void;
  clearError: () => void;
}

export const useIdeasStore = create<IdeasState>((set, get) => ({
  // Initial state
  ideas: [],
  isLoading: false,
  error: null,
  selectedIdea: null,

  // Fetch recent ideas
  fetchIdeas: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('http://localhost:8001/api/v1/ideas/?limit=10');
      if (!response.ok) throw new Error('Failed to fetch ideas');
      const data = await response.json();

      const ideas: RecentIdea[] = data.ideas.map((idea: any) => ({
        id: idea.id,
        input: idea.input,
        action: idea.action,
        status: idea.status,
        created_at: idea.created_at,
        session_id: idea.session_id,
        result_summary: idea.action === 'validate' && idea.confidence
          ? `Confidence: ${Math.round(idea.confidence * 100)}% - ${idea.recommendation || 'pending'}`
          : idea.action === 'plan' ? 'Plan generated' : undefined,
      }));

      set({ ideas, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch ideas',
        isLoading: false,
      });
    }
  },

  // Submit idea
  submitIdea: async (data) => {
    set({ isLoading: true, error: null });
    try {
      let response;
      let endpoint: string;
      let body: any;

      if (data.action === 'execute') {
        endpoint = 'http://localhost:8001/api/v1/ideas/execute';
        body = {
          input: data.input,
          project_id: data.project_id,
          require_review: data.require_review || false,
          run_e2e_tests: data.run_e2e_tests || false,
        };
      } else if (data.action === 'validate') {
        endpoint = 'http://localhost:8001/api/v1/ideas/validate';
        body = {
          input: data.input,
          project_id: data.project_id,
        };
      } else {
        endpoint = 'http://localhost:8001/api/v1/ideas/plan';
        body = {
          input: data.input,
          project_id: data.project_id,
        };
      }

      const fetchResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        throw new Error(`API error: ${errorText}`);
      }

      response = await fetchResponse.json();

      // Add to recent ideas based on action type
      const newIdea: RecentIdea = {
        id: response.idea_id,
        input: data.input,
        action: data.action,
        status: data.action === 'execute' ? 'processing' : 'done',
        created_at: new Date().toISOString(),
        session_id: response.session_id,
        result_summary: data.action === 'validate' && response.confidence
          ? `Confidence: ${Math.round(response.confidence * 100)}% - ${response.recommendation}`
          : data.action === 'plan' ? 'Plan generated' : undefined,
      };
      set({ ideas: [newIdea, ...get().ideas], isLoading: false });

      return response;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit idea',
        isLoading: false,
      });
      throw error;
    }
  },

  // Cancel a running idea
  cancelIdea: async (ideaId: string) => {
    try {
      const response = await fetch(`http://localhost:8001/api/v1/ideas/${ideaId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel idea');
      }

      // Update the idea status in state
      set((state) => ({
        ideas: state.ideas.map((idea) =>
          idea.id === ideaId ? { ...idea, status: 'failed' as const } : idea
        ),
      }));

      // Refresh to get updated list
      get().fetchIdeas();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to cancel idea',
      });
    }
  },

  // Select an idea for detail view
  selectIdea: (idea: RecentIdea | null) => set({ selectedIdea: idea }),

  // Clear error
  clearError: () => set({ error: null }),
}));
