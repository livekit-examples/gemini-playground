import {
  PlaygroundState,
  SessionConfig,
  defaultSessionConfig,
} from "@/data/playground-state";
import { Preset, defaultPresets } from "@/data/presets";
import { IMMUTABLE_NANO_BANANA_PROMPT } from "@/data/immutable-prompt";

export const playgroundStateHelpers = {
  getSelectedPreset: (state: PlaygroundState) => {
    return [...defaultPresets, ...state.userPresets].find(
      (preset) => preset.id === state.selectedPresetId,
    );
  },
  getDefaultPresets: () => defaultPresets,
  getAllPresets: (state: PlaygroundState) => [
    ...defaultPresets,
    ...state.userPresets,
  ],

  encodeToUrlParams: (state: PlaygroundState): string => {
    const params = new URLSearchParams();

    let isDefaultPreset = false;
    const selectedPreset = playgroundStateHelpers.getSelectedPreset(state);
    if (selectedPreset) {
      params.set("preset", selectedPreset.id);
      isDefaultPreset = !!selectedPreset.defaultGroup;
    }

    if (!isDefaultPreset) {
      if (state.instructions) {
        params.set("instructions", state.instructions);
      }

      if (selectedPreset) {
        params.set("presetName", selectedPreset.name);
        if (selectedPreset.description) {
          params.set("presetDescription", selectedPreset.description);
        }
      }

      if (state.sessionConfig) {
        Object.entries(state.sessionConfig).forEach(([key, value]) => {
          if (value !== defaultSessionConfig[key as keyof SessionConfig]) {
            params.set(`sessionConfig.${key}`, String(value));
          }
        });
      }
    }
    return params.toString();
  },

  decodeFromURLParams: (
    urlParams: string,
  ): { state: Partial<PlaygroundState>; preset?: Partial<Preset> } => {
    const params = new URLSearchParams(urlParams);
    const returnValue: {
      state: Partial<PlaygroundState>;
      preset?: Partial<Preset>;
    } = { state: {} };

    const instructions = params.get("instructions");
    if (instructions) {
      returnValue.state.instructions = instructions;
    }

    const sessionConfig: Partial<PlaygroundState["sessionConfig"]> = {};
    params.forEach((value, key) => {
      if (key.startsWith("sessionConfig.")) {
        const configKey = key.split(
          ".",
        )[1] as keyof PlaygroundState["sessionConfig"];
        sessionConfig[configKey] = value as any;
      }
    });

    if (Object.keys(sessionConfig).length > 0) {
      returnValue.state.sessionConfig = sessionConfig as SessionConfig;
    }

    const presetId = params.get("preset");
    if (presetId) {
      returnValue.preset = {
        id: presetId,
        name: params.get("presetName") || undefined,
        description: params.get("presetDescription") || undefined,
      };
      returnValue.state.selectedPresetId = presetId;
    }

    return returnValue;
  },

  updateBrowserUrl: (state: PlaygroundState) => {
    if (typeof window !== "undefined") {
      const params = playgroundStateHelpers.encodeToUrlParams(state);
      const newUrl = `${window.location.origin}${window.location.pathname}${params ? `?${params}` : ""}`;
      window.history.replaceState({}, "", newUrl);
    }
  },

  /**
   * Checks if the immutable nano banana prompt should be used
   * Returns true if nano banana is enabled AND the current preset is NOT the creative-artist preset
   */
  shouldUseImmutablePrompt: (state: PlaygroundState): boolean => {
    const { sessionConfig, selectedPresetId } = state;
    return (
      sessionConfig.nanoBananaEnabled &&
      selectedPresetId !== "creative-artist"
    );
  },

  /**
   * Gets the full instructions with immutable prompt prepended if needed
   */
  getFullInstructions: (state: PlaygroundState): string => {
    const shouldUseImmutable = playgroundStateHelpers.shouldUseImmutablePrompt(state);
    
    if (shouldUseImmutable) {
      return `${IMMUTABLE_NANO_BANANA_PROMPT}\n\n${state.instructions}`;
    }
    
    return state.instructions;
  },

  /**
   * Gets just the immutable prompt if it should be used
   */
  getImmutablePrompt: (state: PlaygroundState): string | null => {
    return playgroundStateHelpers.shouldUseImmutablePrompt(state)
      ? IMMUTABLE_NANO_BANANA_PROMPT
      : null;
  },

  /**
   * Returns a new state object with full instructions (including additional prompt if needed)
   */
  getStateWithFullInstructions: (state: PlaygroundState): PlaygroundState => {
    const fullInstructions = playgroundStateHelpers.getFullInstructions(state);
    return {
      ...state,
      instructions: fullInstructions,
    };
  },
};
