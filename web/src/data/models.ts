export enum ModelId {
  // Native audio models
  GEMINI_2_5_FLASH_NATIVE_AUDIO_PREVIEW_09_2025 = "gemini-2.5-flash-native-audio-preview-09-2025",
  GEMINI_2_5_FLASH_PREVIEW_NATIVE_AUDIO_DIALOG = "gemini-2.5-flash-preview-native-audio-dialog",
  GEMINI_2_5_FLASH_EXP_NATIVE_AUDIO_THINKING_DIALOG = "gemini-2.5-flash-exp-native-audio-thinking-dialog",
  
  // Half-cascade audio models
  GEMINI_LIVE_2_5_FLASH_PREVIEW = "gemini-live-2.5-flash-preview",
  GEMINI_2_0_FLASH_LIVE_001 = "gemini-2.0-flash-live-001",
}

export enum ModelCategory {
  NATIVE_AUDIO = "Native Audio",
  HALF_CASCADE_AUDIO = "Half-Cascade Audio",
}

export interface Model {
  id: ModelId;
  name: string;
  description: string;
  category: ModelCategory;
  isNew?: boolean;
}

export const modelsData: Record<ModelId, Model> = {
  [ModelId.GEMINI_2_5_FLASH_NATIVE_AUDIO_PREVIEW_09_2025]: {
    id: ModelId.GEMINI_2_5_FLASH_NATIVE_AUDIO_PREVIEW_09_2025,
    name: "Gemini 2.5 Flash Native Audio",
    description: "Natural speech with emotion-aware dialogue and thinking (09/2025)",
    category: ModelCategory.NATIVE_AUDIO,
    isNew: true,
  },
  [ModelId.GEMINI_2_5_FLASH_PREVIEW_NATIVE_AUDIO_DIALOG]: {
    id: ModelId.GEMINI_2_5_FLASH_PREVIEW_NATIVE_AUDIO_DIALOG,
    name: "Gemini 2.5 Flash Native Audio Dialog",
    description: "Optimized for conversational interactions",
    category: ModelCategory.NATIVE_AUDIO,
  },
  [ModelId.GEMINI_2_5_FLASH_EXP_NATIVE_AUDIO_THINKING_DIALOG]: {
    id: ModelId.GEMINI_2_5_FLASH_EXP_NATIVE_AUDIO_THINKING_DIALOG,
    name: "Gemini 2.5 Flash Exp Thinking Dialog",
    description: "Experimental model with advanced reasoning",
    category: ModelCategory.NATIVE_AUDIO,
  },
  [ModelId.GEMINI_LIVE_2_5_FLASH_PREVIEW]: {
    id: ModelId.GEMINI_LIVE_2_5_FLASH_PREVIEW,
    name: "Gemini Live 2.5 Flash",
    description: "Better performance with tool use in production",
    category: ModelCategory.HALF_CASCADE_AUDIO,
  },
  [ModelId.GEMINI_2_0_FLASH_LIVE_001]: {
    id: ModelId.GEMINI_2_0_FLASH_LIVE_001,
    name: "Gemini 2.0 Flash Live",
    description: "Reliable cascaded architecture for production",
    category: ModelCategory.HALF_CASCADE_AUDIO,
  },
};

export const models: Model[] = Object.values(modelsData);

export const modelsByCategory: Record<ModelCategory, Model[]> = {
  [ModelCategory.NATIVE_AUDIO]: models.filter(m => m.category === ModelCategory.NATIVE_AUDIO),
  [ModelCategory.HALF_CASCADE_AUDIO]: models.filter(m => m.category === ModelCategory.HALF_CASCADE_AUDIO),
};
