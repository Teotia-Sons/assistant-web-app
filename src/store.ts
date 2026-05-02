import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { ModelTag, ReasoningEffort } from './services/models';

export interface ModelConfig {
  modelInstance: ModelTag;
  reasoningEffort: ReasoningEffort;
}

export interface PersonalInfoConfig {
  addPersonalInfo: boolean;
  addPersonalBias: boolean;
}

interface AppStore {
  prompt: string;
  modelConfig: ModelConfig;
  defaultModelConfig: ModelConfig;
  personalInfoConfig: PersonalInfoConfig;
  defaultPersonalInfoConfig: PersonalInfoConfig;
  setPrompt: (prompt: string) => void;
  setModelConfig: (modelConfig: ModelConfig) => void;
  setDefaultModelConfig: (modelConfig: ModelConfig) => void;
  setPersonalInfoConfig: (config: PersonalInfoConfig) => void;
  setDefaultPersonalInfoConfig: (config: PersonalInfoConfig) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    set => ({
      prompt: '',
      modelConfig: {
        modelInstance: ModelTag.GROK,
        reasoningEffort: ReasoningEffort.NONE,
      },
      setPrompt: (prompt: string) => set({ prompt }),
      setModelConfig: (modelConfig: ModelConfig) => set({ modelConfig }),

      defaultModelConfig: {
        modelInstance: ModelTag.GROK,
        reasoningEffort: ReasoningEffort.NONE,
      },
      setDefaultModelConfig: (modelConfig: ModelConfig) =>
        set({ defaultModelConfig: modelConfig }),

      personalInfoConfig: {
        addPersonalInfo: false,
        addPersonalBias: false,
      },
      setPersonalInfoConfig: (config: PersonalInfoConfig) =>
        set({ personalInfoConfig: config }),

      defaultPersonalInfoConfig: {
        addPersonalInfo: false,
        addPersonalBias: false,
      },
      setDefaultPersonalInfoConfig: (config: PersonalInfoConfig) =>
        set({ defaultPersonalInfoConfig: config }),
    }),
    {
      name: 'genai-app-store',
      partialize: state => ({
        defaultModelConfig: state.defaultModelConfig,
        defaultPersonalInfoConfig: state.defaultPersonalInfoConfig,
      }),
      merge: (persistedState: unknown, currentState: AppStore) => {
        const persisted = persistedState as Partial<typeof currentState>;
        return {
          ...currentState,
          ...persisted,
          modelConfig: persisted.defaultModelConfig || currentState.modelConfig,
          personalInfoConfig:
            persisted.defaultPersonalInfoConfig ||
            currentState.personalInfoConfig,
        };
      },
    },
  ),
);
