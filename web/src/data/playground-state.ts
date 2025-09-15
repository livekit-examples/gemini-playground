import { ModalitiesId } from "@/data/modalities";
import { VoiceId } from "@/data/voices";
import { Preset } from "./presets";
import { ModelId } from "./models";

export interface SessionConfig {
  model: ModelId;
  modalities: ModalitiesId;
  voice: VoiceId;
  temperature: number;
  maxOutputTokens: number | null;
}

export interface PlaygroundState {
  sessionConfig: SessionConfig;
  userPresets: Preset[];
  selectedPresetId: string | null;
  instructions: string;
}

export const defaultSessionConfig: SessionConfig = {
  model: ModelId.GEMINI_2_0_FLASH_EXT, // hardcoded: gemini-2.0-flash-exp
  modalities: ModalitiesId.AUDIO_ONLY, // hardcoded: audio only
  voice: VoiceId.PUCK, // default to male voice, can be changed to KORE for female
  temperature: 0.8, // hardcoded: 0.8
  maxOutputTokens: null, // hardcoded: no limit
};

// Define the initial state
export const defaultPlaygroundState: PlaygroundState = {
  sessionConfig: { ...defaultSessionConfig },
  userPresets: [],
  selectedPresetId: "acai-cooking-assistant",
  instructions:
    "You are Acai ('aa-saa-ee'), a friendly and helpful cooking assistant. Guide users through recipes step-by-step with clear, encouraging instructions. Focus on cooking safety, technique tips, and ingredient guidance. Keep responses concise and kitchen-appropriate since users may have their hands full while cooking.",
};
