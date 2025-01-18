export enum ModelId {
  GEMINI_2_0_FLASH_EXT = "gemini-2.0-flash-exp",
}

export interface Model {
  id: ModelId;
  name: string;
}

export const models: Model[] = [
  {
    id: ModelId.GEMINI_2_0_FLASH_EXT,
    name: ModelId.GEMINI_2_0_FLASH_EXT,
  },
];
