"use client";

import { useState, useEffect } from "react";
import { Instructions } from "@/components/instructions";
import { SessionControls } from "@/components/session-controls";
import { ConnectButton } from "./connect-button";
import { ConnectionState } from "livekit-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  useConnectionState,
  useVoiceAssistant,
} from "@livekit/components-react";
import { ChatControls } from "@/components/chat-controls";
import { useAgent } from "@/hooks/use-agent";
import { useConnection } from "@/hooks/use-connection";
import { toast } from "@/hooks/use-toast";
import { GeminiVisualizer } from "@/components/visualizer/gemini-visualizer";
import { NanoBananaFeed } from "@/components/nano-banana-feed";

export function Chat() {
  const connectionState = useConnectionState();
  const { audioTrack, state } = useVoiceAssistant();
  const [isChatRunning, setIsChatRunning] = useState(false);
  const { agent } = useAgent();
  const { disconnect } = useConnection();
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);

  const [hasSeenAgent, setHasSeenAgent] = useState(false);

  useEffect(() => {
    let disconnectTimer: NodeJS.Timeout | undefined;
    let appearanceTimer: NodeJS.Timeout | undefined;

    if (connectionState === ConnectionState.Connected && !agent) {
      appearanceTimer = setTimeout(() => {
        disconnect();
        setHasSeenAgent(false);

        toast({
          title: "Agent Unavailable",
          description:
            "Unable to connect to an agent right now. Please try again later.",
          variant: "destructive",
        });
      }, 5000);
    }

    if (agent) {
      setHasSeenAgent(true);
    }

    if (
      connectionState === ConnectionState.Connected &&
      !agent &&
      hasSeenAgent
    ) {
      // Agent disappeared while connected, wait 5s before disconnecting
      disconnectTimer = setTimeout(() => {
        if (!agent) {
          disconnect();
          setHasSeenAgent(false);
        }

        toast({
          title: "Agent Disconnected",
          description:
            "The AI agent has unexpectedly left the conversation. Please try again.",
          variant: "destructive",
        });
      }, 5000);
    }

    setIsChatRunning(
      connectionState === ConnectionState.Connected && hasSeenAgent
    );

    return () => {
      if (disconnectTimer) clearTimeout(disconnectTimer);
      if (appearanceTimer) clearTimeout(appearanceTimer);
    };
  }, [connectionState, agent, disconnect, hasSeenAgent]);

  const toggleInstructionsEdit = () =>
    setIsEditingInstructions(!isEditingInstructions);

  const renderVisualizer = () => (
    <div className="flex w-full items-center">
      <div className="h-[280px] lg:h-[400px] mt-16 md:mt-0 lg:pb-24 w-full">
        <GeminiVisualizer 
          key={audioTrack?.publication?.trackSid || 'no-track'} 
          agentState={state} 
          agentTrackRef={audioTrack} 
        />
      </div>
    </div>
  );

  const renderConnectionControl = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key={isChatRunning ? "session-controls" : "connect-button"}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ type: "tween", duration: 0.15, ease: "easeInOut" }}
      >
        {isChatRunning ? <SessionControls /> : <ConnectButton />}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden p-2 lg:p-4 min-w-0">
      <ChatControls
        showEditButton={isChatRunning}
        isEditingInstructions={isEditingInstructions}
        onToggleEdit={toggleInstructionsEdit}
      />
      <div className="flex flex-col flex-grow items-center lg:justify-between mt-12 lg:mt-0 min-w-0">
        <div className="w-full h-full flex flex-col min-w-0 gap-4">
          {/* Mobile: Show instructions and visualizer stacked */}
          <div className="lg:hidden w-full min-w-0 flex flex-col gap-4">
            <Instructions />
            {renderVisualizer()}
          </div>
          
          {/* Desktop: Show instructions at top, visualizer in middle */}
          <div className="hidden lg:flex lg:flex-col lg:h-full lg:min-w-0 w-full">
            <div className="flex items-center justify-center w-full min-w-0">
              <Instructions />
            </div>
            <div className="grow h-full flex items-center justify-center min-w-0">
              <div className="w-full min-w-0">
                {!isEditingInstructions && renderVisualizer()}
              </div>
            </div>
          </div>
          
          <NanoBananaFeed />
        </div>

        <div className="my-4">{renderConnectionControl()}</div>
      </div>
    </div>
  );
}
