"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Info, Check, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { models, ModelId, ModelCategory, modelsByCategory } from "@/data/models";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ModelsShowcaseProps {
  onSelectModel?: (modelId: ModelId) => void;
  currentModel?: ModelId;
  onOpenChange?: (open: boolean) => void;
}

export function ModelsShowcase({ onSelectModel, currentModel, onOpenChange }: ModelsShowcaseProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const getCategoryDescription = (category: ModelCategory) => {
    if (category === ModelCategory.NATIVE_AUDIO) {
      return "Most natural speech with emotion-aware dialogue, proactive audio, and thinking capabilities";
    }
    return "Cascaded architecture with better performance and reliability for production, especially with tool use";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="View all models"
        >
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col p-0">
        <div className="px-6 py-5 border-b border-separator1">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-fg0">
              Available Models
            </DialogTitle>
            <DialogDescription className="text-base text-fg1 mt-2">
              Choose from {models.length} Gemini models optimized for live interactions.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {Object.entries(modelsByCategory).map(([category, categoryModels]) => (
              <div key={category} className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-fg0">
                    {category}
                  </h3>
                  <p className="text-xs text-fg2">
                    {getCategoryDescription(category as ModelCategory)}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {categoryModels.map((model) => {
                    const isSelected = currentModel === model.id;
                    return (
                      <button
                        key={model.id}
                        onClick={() => {
                          onSelectModel?.(model.id);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex flex-col gap-2 p-4 rounded-lg border transition-all text-left",
                          isSelected
                            ? "border-fgAccent1 bg-bg2 ring-2 ring-fgAccent1/20"
                            : "border-separator1 bg-bg0 hover:bg-bg2 hover:border-fg3"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-fg0">
                                {model.name}
                              </h4>
                              {model.isNew && (
                                <Badge variant="default" className="text-xs gap-1 bg-fgAccent1 text-bg0">
                                  <Sparkles className="h-3 w-3" />
                                  NEW
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-fg2">
                              {model.description}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="h-5 w-5 text-fgAccent1 shrink-0 mt-0.5" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-separator1 bg-bg1">
          <p className="text-xs text-fg2">
            <span className="font-semibold">Tip:</span> Native audio models provide the most natural speech but may have higher latency. 
            Half-cascade models are optimized for production use with tools.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

