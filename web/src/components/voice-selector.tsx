"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ConfigurationFormFieldProps,
  ConfigurationFormSchema,
} from "@/components/configuration-form";
import { voices } from "@/data/voices";
import { VoicesShowcase } from "@/components/voices-showcase";

export function VoiceSelector({ form, ...props }: ConfigurationFormFieldProps) {
  const [hoverCardOpen, setHoverCardOpen] = React.useState(false);

  return (
    <FormField
      control={form.control}
      name="voice"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center space-y-0 justify-between px-1">
          <div className="flex items-center gap-2">
            <FormLabel className="text-sm font-medium text-fg1">Voice</FormLabel>
            <VoicesShowcase 
              onSelectVoice={(voiceId) => {
                if (ConfigurationFormSchema.shape.voice.safeParse(voiceId).success) {
                  field.onChange(voiceId);
                }
              }}
              currentVoice={field.value}
              onOpenChange={(open) => {
                if (open) setHoverCardOpen(false);
              }}
            />
          </div>
          <HoverCard openDelay={200} open={hoverCardOpen} onOpenChange={setHoverCardOpen}>
            <HoverCardTrigger asChild>
              <div>
                <Select
                  onValueChange={(v) => {
                    if (
                      ConfigurationFormSchema.shape.voice.safeParse(v).success
                    ) {
                      field.onChange(v);
                    }
                  }}
                  defaultValue={form.formState.defaultValues!.voice!}
                  value={field.value}
                  aria-label="Voice"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose voice" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem
                        key={`select-item-voice-${voice.id}`}
                        value={voice.id}
                      >
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </HoverCardTrigger>
            <HoverCardContent
              align="start"
              className="w-[260px] text-sm"
              side="right"
            >
              Choose the base voice for the model.
            </HoverCardContent>
          </HoverCard>
        </FormItem>
      )}
    />
  );
}
