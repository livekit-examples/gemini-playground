"use client";

import { useState } from "react";
import { InstructionsEditor } from "@/components/instructions-editor";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import { playgroundStateHelpers } from "@/lib/playground-state-helpers";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CircleHelp, ChevronDown, ChevronRight } from "lucide-react";

export function Instructions() {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { pgState } = usePlaygroundState();
  
  const immutablePrompt = playgroundStateHelpers.getImmutablePrompt(pgState);

  return (
    <div
      className={`flex flex-1 flex-col w-full min-w-0 gap-[4px] text-neutral-300 bg-neutral-950  shadow-md p-4 rounded-lg overflow-y-auto overflow-x-hidden`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <div className="text-xs font-semibold uppercase mr-1 tracking-widest">
            INSTRUCTIONS
          </div>
          <HoverCard open={isOpen}>
            <HoverCardTrigger asChild>
              <CircleHelp
                className="h-4 w-4 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
              />
            </HoverCardTrigger>
            <HoverCardContent
              className="w-[260px] text-sm"
              side="bottom"
              onInteractOutside={() => setIsOpen(false)}
            >
              Instructions are a system message that is prepended to the
              conversation whenever the model responds. Updates will be
              reflected on the next conversation turn.
              {immutablePrompt && (
                <>
                  <br /><br />
                  <strong>Note:</strong> Nano Banana adds additional instructions for image generation.
                </>
              )}
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
      
      <InstructionsEditor
        instructions={pgState.instructions}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      
      {immutablePrompt && (
        <div className="mt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-300 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <span>Nano Banana Instructions Included</span>
          </button>
          {isExpanded && (
            <div className="mt-2 p-2 text-xs font-mono leading-loose text-neutral-500 whitespace-pre-wrap">
              {immutablePrompt}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
