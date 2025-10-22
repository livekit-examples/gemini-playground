"use client";

import * as React from "react";
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
import { Switch } from "@/components/ui/switch";
import { ConfigurationFormFieldProps } from "@/components/configuration-form";

export function NanoBananaToggle({ form }: ConfigurationFormFieldProps) {
  const [hoverCardOpen, setHoverCardOpen] = React.useState(false);

  return (
    <FormField
      control={form.control}
      name="nanoBananaEnabled"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center space-y-0 justify-between px-1">
          <FormLabel className="text-sm font-medium text-fg1">
            🍌 Nano Banana
          </FormLabel>
          <HoverCard openDelay={200} open={hoverCardOpen} onOpenChange={setHoverCardOpen}>
            <HoverCardTrigger asChild>
              <div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Enable Nano Banana image generation"
                  />
                </FormControl>
              </div>
            </HoverCardTrigger>
            <HoverCardContent
              align="start"
              className="w-[260px] text-sm"
              side="right"
            >
              <div className="space-y-2">
                <p className="font-semibold text-fg0">Imagen 4 Integration</p>
                <p className="text-fg2">
                  Generate images using Google&apos;s Imagen 4 model. When enabled, 
                  the agent can create visual content in response to your requests.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </FormItem>
      )}
    />
  );
}

