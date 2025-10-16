"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Info, ExternalLink, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { voices, VoiceId } from "@/data/voices";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VoicesShowcaseProps {
  onSelectVoice?: (voiceId: VoiceId) => void;
  currentVoice?: VoiceId;
  onOpenChange?: (open: boolean) => void;
}

export function VoicesShowcase({ onSelectVoice, currentVoice, onOpenChange }: VoicesShowcaseProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="View all voices"
        >
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col p-0">
        <div className="px-6 py-5 border-b border-separator1">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-fg0">
              Available Voices
            </DialogTitle>
            <DialogDescription className="text-base text-fg1 mt-2">
              Choose from {voices.length} unique voice options for your AI agent.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {voices.map((voice) => {
              const isSelected = currentVoice === voice.id;
              return (
                <button
                  key={voice.id}
                  onClick={() => {
                    onSelectVoice?.(voice.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex flex-col gap-2 p-4 rounded-lg border transition-all text-left",
                    isSelected
                      ? "border-fgAccent1 bg-bg2 ring-2 ring-fgAccent1/20"
                      : "border-separator1 bg-bg0 hover:bg-bg2 hover:border-fg3"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-fg0 truncate">
                        {voice.name}
                      </h3>
                      {isSelected && (
                        <Check className="h-4 w-4 text-fgAccent1 shrink-0" />
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {voice.characteristic}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-separator1 bg-bg1">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-fg2">
              Listen to all voices in Google AI Studio
            </p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ExternalLink />}
              onClick={() =>
                window.open(
                  "https://aistudio.google.com/generate-speech",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              Try in AI Studio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

