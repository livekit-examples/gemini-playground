"use client";

import { useState } from "react";
import { VoiceId } from "@/data/voices";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type VoiceOption = {
  id: VoiceId;
  name: string;
  gender: "male" | "female";
  description: string;
};

const voiceOptions: VoiceOption[] = [
  {
    id: VoiceId.PUCK,
    name: "Acai with Male Voice",
    gender: "male",
    description: ""
  },
  {
    id: VoiceId.KORE,
    name: "Acai with Female Voice", 
    gender: "female",
    description: ""
  }
];

export function VoiceSelection() {
  const { pgState, dispatch } = usePlaygroundState();
  const [selectedVoice, setSelectedVoice] = useState<VoiceId>(
    pgState.sessionConfig.voice || VoiceId.PUCK
  );

  const handleVoiceChange = (voiceId: VoiceId) => {
    setSelectedVoice(voiceId);
    dispatch({
      type: "SET_SESSION_CONFIG",
      payload: { voice: voiceId }
    });
  };

  const handleVoiceChangeSelect = (value: string) => {
    const voiceId = value as VoiceId;
    handleVoiceChange(voiceId);
  };

  const selectedOption = voiceOptions.find(option => option.id === selectedVoice);

  return (
    <div className="w-full">
      <Select value={selectedVoice} onValueChange={handleVoiceChangeSelect}>
        <SelectTrigger className="w-full bg-background border-border text-foreground hover:bg-accent">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{selectedOption?.gender === "male" ? "👨‍🍳" : "👩‍🍳"}</span>
              <span className="font-medium">{selectedOption?.name}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border text-popover-foreground">
          {voiceOptions.map((voice) => (
            <SelectItem 
              key={voice.id} 
              value={voice.id}
              className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              <div className="flex items-center gap-2">
                <span>{voice.gender === "male" ? "👨‍🍳" : "👩‍🍳"}</span>
                <span className="font-medium">{voice.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
