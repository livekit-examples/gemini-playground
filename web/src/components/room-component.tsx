"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";

import { Chat } from "@/components/chat";
import { VoiceSelection } from "@/components/voice-selection";
import { useConnection } from "@/hooks/use-connection";
import { AgentProvider } from "@/hooks/use-agent";

export function RoomComponent() {
  const { shouldConnect, wsUrl, token } = useConnection();
  return (
    <LiveKitRoom
      serverUrl={wsUrl}
      token={token}
      connect={shouldConnect}
      audio={true}
      className="flex flex-col flex-grow overflow-hidden max-w-md mx-auto w-full px-4"
      options={{
        publishDefaults: {
          stopMicTrackOnMute: true,
        },
      }}
    >
      <AgentProvider>
        {/* Voice selection at top - compact */}
        <div className="py-3">
          <VoiceSelection />
        </div>
        
        {/* Main chat area - takes remaining space */}
        <div className="flex flex-col flex-grow rounded-2xl bg-card border border-border overflow-hidden">
          <Chat />
        </div>
        <RoomAudioRenderer />
        <StartAudio label="Click to allow audio playback" />
      </AgentProvider>
    </LiveKitRoom>
  );
}
