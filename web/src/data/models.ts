export enum ModelId {
  // Native audio models
  GEMINI_3_1_FLASH_LIVE_PREVIEW = "gemini-3.1-flash-live-preview",
}

export enum ModelCategory {
  NATIVE_AUDIO = "Native Audio",
}

export interface Model {
  id: ModelId;
  name: string;
  description: string;
  category: ModelCategory;
  isNew?: boolean;
}

export const modelsData: Record<ModelId, Model> = {
  [ModelId.GEMINI_3_1_FLASH_LIVE_PREVIEW]: {
    id: ModelId.GEMINI_3_1_FLASH_LIVE_PREVIEW,
    name: "Gemini 3.1 Flash Live",
    description: "High-quality, low-latency audio-to-audio model for real-time dialogue (03/2026)",
    category: ModelCategory.NATIVE_AUDIO,
    isNew: true,
  },
};

export const models: Model[] = Object.values(modelsData);

export const modelsByCategory: Record<ModelCategory, Model[]> = {
  [ModelCategory.NATIVE_AUDIO]: models.filter(m => m.category === ModelCategory.NATIVE_AUDIO),
};
