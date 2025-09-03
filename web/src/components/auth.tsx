"use client";

import React from "react";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChefHat, Sparkles } from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export function Auth() {
  const { showAuthDialog, setShowAuthDialog } = usePlaygroundState();

  return (
    <div>
      <WelcomeDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onWelcomeComplete={() => setShowAuthDialog(false)}
      />
    </div>
  );
}

export function WelcomeDialog({
  open,
  onOpenChange,
  onWelcomeComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWelcomeComplete: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md p-0 border-0 rounded-lg overflow-hidden max-h-[90vh] flex flex-col"
        isModal={true}
      >
        <div className="overflow-y-auto">
          <div className="px-6 pb-6 pt-4 overflow-y-auto">
            <DialogHeader className="gap-4 text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <ChefHat className="h-12 w-12 text-orange-500" />
                  <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
                </div>
              </div>
              <DialogTitle className="text-2xl">
                Welcome to All You Can Cook!
              </DialogTitle>
              <DialogDescription className="text-base">
                Meet <strong className="text-orange-600">Acai</strong>, your friendly AI cooking assistant! 
                I&apos;m here to guide you through recipes step-by-step with voice instructions, 
                cooking tips, and kitchen safety advice.
              </DialogDescription>
              <DialogDescription>
                Built with{" "}
                <a
                  href="https://github.com/livekit/agents"
                  target="_blank"
                  className="underline text-orange-600 hover:text-orange-700"
                >
                  LiveKit Agents
                </a>{" "}
                and powered by Google&apos;s Gemini 2.0 Multimodal Live API.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                What I can help you with:
              </h3>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Step-by-step cooking guidance</li>
                <li>• Ingredient substitutions and measurements</li>
                <li>• Cooking techniques and timing</li>
                <li>• Kitchen safety tips</li>
                <li>• Recipe troubleshooting</li>
              </ul>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => onWelcomeComplete()}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Let&apos;s Start Cooking! 👨‍🍳
              </button>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-center">
              <a
                href="https://github.com/livekit-examples/gemini-playground"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-gray-700 underline flex items-center gap-1"
              >
                <GitHubLogoIcon className="h-4 w-4" />
                View source on GitHub
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
