"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";

import { ConfigurationForm } from "@/components/configuration-form";
import { Chat } from "@/components/chat";
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
      className="flex flex-col px-4 md:grid md:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr] flex-grow overflow-hidden"
      options={{
        publishDefaults: {
          stopMicTrackOnMute: true,
        },
      }}
    >
      <AgentProvider>
        <div className="hidden lg:block h-full overflow-y-auto relative pr-4">
          <ConfigurationForm />
        </div>
        <div className="w-full flex flex-col h-full mx-auto rounded-2xl bg-neutral-950 border border-neutral-800">
          <Chat />
        </div>
        <RoomAudioRenderer />
        <StartAudio label="Click to allow audio playback" />
      </AgentProvider>
    </LiveKitRoom>
  );
}
