"use client";

import { ModalitiesSelector } from "@/components/modalities-selector";
import { VoiceSelector } from "@/components/voice-selector";
import { TemperatureSelector } from "./temperature-selector";
import { MaxOutputTokensSelector } from "./max-output-tokens-selector";
import { ConfigurationFormFieldProps } from "./configuration-form";
import { ModelSelector } from "./model-selector";
export function SessionConfig({ form }: ConfigurationFormFieldProps) {
  return (
    <div className="space-y-4 pt-2">
      <ModelSelector form={form} />
      <VoiceSelector form={form} />
      <ModalitiesSelector form={form} />
      <TemperatureSelector form={form} />
      <MaxOutputTokensSelector form={form} />
    </div>
  );
}
