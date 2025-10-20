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
import { models, modelsData } from "@/data/models";
import { ModelsShowcase } from "@/components/models-showcase";

export function ModelSelector({ form, ...props }: ConfigurationFormFieldProps) {
  const [hoverCardOpen, setHoverCardOpen] = React.useState(false);

  return (
    <FormField
      control={form.control}
      name="model"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center space-y-0 justify-between px-1">
          <div className="flex items-center gap-2">
            <FormLabel className="text-sm font-medium text-fg1">Model</FormLabel>
            <ModelsShowcase 
              onSelectModel={(modelId) => {
                if (ConfigurationFormSchema.shape.model.safeParse(modelId).success) {
                  field.onChange(modelId);
                }
              }}
              currentModel={field.value}
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
                      ConfigurationFormSchema.shape.model.safeParse(v).success
                    ) {
                      field.onChange(v);
                    }
                  }}
                  disabled={true}
                  defaultValue={form.formState.defaultValues!.model!}
                  value={field.value}
                  aria-label="Model"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose model" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem
                        key={`select-item-model-${model.id}`}
                        value={model.id}
                      >
                        {model.name}
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
              {field.value && modelsData[field.value] ? (
                <div className="space-y-2">
                  <p className="font-semibold text-fg0">{modelsData[field.value].category}</p>
                  <p className="text-fg2">{modelsData[field.value].description}</p>
                </div>
              ) : (
                <p>Choose a Gemini multimodal live model</p>
              )}
            </HoverCardContent>
          </HoverCard>
        </FormItem>
      )}
    />
  );
}
