"use client";

import { Copy, Share } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import { playgroundStateHelpers } from "@/lib/playground-state-helpers";
import { LockClosedIcon } from "@radix-ui/react-icons";

export function PresetShare() {
  const { pgState } = usePlaygroundState();
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = playgroundStateHelpers.encodeToUrlParams(pgState);
      setLink(
        `${window.location.origin}${window.location.pathname}${params ? `?${params}` : ""}`
      );
    }
  }, [pgState]);

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="secondary">
          <Share className="h-4 w-4" />
          <span className="ml-2 hidden md:block">Share</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[520px] p-0">
        <div className="px-6 py-5 border-b border-separator1">
          <h3 className="text-lg font-semibold text-fg0">Share Preset</h3>
          <p className="text-sm text-fg2 mt-2">
            Anyone with this link and their own Gemini API key can try what
            you&apos;ve come up with.
          </p>
        </div>
        <div className="px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input 
                id="link" 
                defaultValue={link} 
                readOnly 
                className="h-9 font-mono text-xs"
              />
            </div>
            <Button 
              type="button" 
              variant={copied ? "secondary" : "primary"}
              size="sm" 
              onClick={handleCopy}
              leftIcon={<Copy />}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
        <div className="px-6 py-4 bg-bg2 border-t border-separator1 rounded-b-lg">
          <div className="flex items-center gap-2 text-xs text-fg2">
            <LockClosedIcon className="h-3 w-3 flex-shrink-0" />
            <span>Your Gemini API key will not be shared.</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
