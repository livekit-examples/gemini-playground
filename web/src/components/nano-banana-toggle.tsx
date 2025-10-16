"use client";

import * as React from "react";
import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { ConfigurationFormFieldProps } from "@/components/configuration-form";

export function NanoBananaToggle({ form }: ConfigurationFormFieldProps) {
  return (
    <FormField
      control={form.control}
      name="nanoBananaEnabled"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center space-y-0 justify-between px-1">
          <FormLabel className="text-sm font-medium text-fg1">
            🍌 Nano Banana
          </FormLabel>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-label="Enable Nano Banana image generation"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

