export enum ModalitiesId {
  TEXT_AND_AUDIO = "text_and_audio",
  TEXT_ONLY = "text_only",
}

export interface Modalities {
  id: ModalitiesId;
  name: string;
  description: string;
}

export const modalities: Modalities[] = [
  {
    id: ModalitiesId.TEXT_AND_AUDIO,
    name: "Audio + Text",
    description: "The model will produce both audio and text.",
  },
  {
    id: ModalitiesId.TEXT_ONLY,
    name: "Text Only",
    description: "The model will produce text only.",
  },
];
