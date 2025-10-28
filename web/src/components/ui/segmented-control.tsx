"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface SegmentedControlProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export default function SegmentedControl({
  value,
  onValueChange,
  options,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "flex items-center w-full bg-bg1 border border-separator1 rounded-[4px] p-[2px] gap-[2px]",
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <Button
            key={option.value}
            onClick={() => onValueChange(option.value)}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "flex-1 shrink-0",
              // Force consistent border on all states - use ! to override variant styles
              "!border !border-solid",
              isActive ? "!border-separator1" : "!border-transparent",
              // Match Figma padding precisely
              "!px-3 !py-1",
              // Match Figma border radius
              "!rounded-[2px]",
              // Disable scale animation within segmented control
              "!active:scale-100",
              // Adjust focus ring to stay within container
              "focus-visible:ring-offset-0",
              // Optimize transitions - only transition properties that actually change
              "!transition-colors !duration-150"
            )}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

