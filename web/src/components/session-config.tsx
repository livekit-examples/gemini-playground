"use client";

import { ModalitiesSelector } from "@/components/modalities-selector";
import { VoiceSelector } from "@/components/voice-selector";
import { TemperatureSelector } from "./temperature-selector";
import { MaxOutputTokensSelector } from "./max-output-tokens-selector";
import { NanoBananaToggle } from "./nano-banana-toggle";
import { ConfigurationFormFieldProps } from "./configuration-form";
import { ModelSelector } from "./model-selector";
export function SessionConfig({ form }: ConfigurationFormFieldProps) {
  return (
    <div className="space-y-5">
      <ModelSelector form={form} />
      <VoiceSelector form={form} />
      <ModalitiesSelector form={form} />
      <TemperatureSelector form={form} />
      <MaxOutputTokensSelector form={form} />
      <NanoBananaToggle form={form} />
    </div>
  );
}
