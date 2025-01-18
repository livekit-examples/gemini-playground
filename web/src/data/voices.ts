export enum VoiceId {
  PUCK = "Puck",
  CHARON = "Charon",
  KORE = "Kore",
  FENRIR = "Fenrir",
  AOEDE = "Aoede",
}

export interface Voice {
  id: VoiceId;
  name: string;
}

export const voices: Voice[] = Object.values(VoiceId).map((id) => ({
  id,
  name: id,
}));
