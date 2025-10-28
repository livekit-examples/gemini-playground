"use client";

import * as React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import {
  ConfigurationFormFieldProps,
  ConfigurationFormSchema,
} from "@/components/configuration-form";
import { Input } from "@/components/ui/input";
import { z } from "zod";

const getMinMaxForField = (schema: z.ZodNumber) => {
  return {
    minValue: schema.minValue ?? undefined,
    maxValue: schema.maxValue ?? undefined,
  };
};

export function TemperatureSelector({
  form,
  schema,
  ...props
}: ConfigurationFormFieldProps) {
  const { minValue, maxValue } = getMinMaxForField(
    ConfigurationFormSchema.shape.temperature,
  );

  return (
    <div
      className="pb-2"
    >
      <FormField
        control={form.control}
        name="temperature"
        render={({ field }) => (
          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <FormItem className="px-1">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium text-fg1">Temperature</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      className="w-[100px]"
                    />
                  </FormControl>
                </div>
                <FormControl className="mt-2">
                  <Slider
                    max={maxValue}
                    min={minValue}
                    defaultValue={[form.formState.defaultValues!.temperature!]}
                    step={0.01}
                    onValueChange={(v) => field.onChange(v[0])}
                    value={[field.value]}
                    className="pt-2 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                    aria-label="Temperature"
                  />
                </FormControl>
              </FormItem>
            </HoverCardTrigger>
            <HoverCardContent align="start" className="w-[260px] text-sm" side="right">
              Adjust the randomness of the response. Lowering the temperature
              will make the response more deterministic and repetitive.
            </HoverCardContent>
          </HoverCard>
        )}
      />
    </div>
  );
}
