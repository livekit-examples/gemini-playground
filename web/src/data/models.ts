export enum ModelId {
  // Native audio models
  GEMINI_2_5_FLASH_NATIVE_AUDIO_PREVIEW_09_2025 = "gemini-2.5-flash-native-audio-preview-09-2025",
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
  [ModelId.GEMINI_2_5_FLASH_NATIVE_AUDIO_PREVIEW_09_2025]: {
    id: ModelId.GEMINI_2_5_FLASH_NATIVE_AUDIO_PREVIEW_09_2025,
    name: "Gemini 2.5 Flash Native Audio",
    description: "Natural speech with emotion-aware dialogue and thinking (09/2025)",
    category: ModelCategory.NATIVE_AUDIO,
    isNew: true,
  },
};

export const models: Model[] = Object.values(modelsData);

export const modelsByCategory: Record<ModelCategory, Model[]> = {
  [ModelCategory.NATIVE_AUDIO]: models.filter(m => m.category === ModelCategory.NATIVE_AUDIO),
};
