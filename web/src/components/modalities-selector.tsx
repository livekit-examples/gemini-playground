"use client";

import {
  ConfigurationFormFieldProps,
} from "@/components/configuration-form";
import {
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { modalities } from "@/data/modalities";

export function ModalitiesSelector({
  form,
  ...props
}: ConfigurationFormFieldProps) {
  return (
    <FormField
      control={form.control}
      name="modalities"
      render={({ field }) => (
        <HoverCard openDelay={200}>
          <HoverCardTrigger asChild>
            <FormItem className="flex flex-row items-center space-y-0 justify-between px-1">
              <FormLabel className="text-sm font-medium text-fg1">Response modalities</FormLabel>
              <div className="text-sm text-fg2 cursor-help">
                {modalities.find(m => m.id === field.value)?.name || field.value}
              </div>
            </FormItem>
          </HoverCardTrigger>
          <HoverCardContent
            align="start"
            className="w-[260px] text-sm"
            side="right"
          >
            The set of modalities the model can respond with.
          </HoverCardContent>
        </HoverCard>
      )}
    />
  );
}
