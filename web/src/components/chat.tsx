"use client";

import { useState, useEffect } from "react";

import { SessionControls } from "@/components/session-controls";
import { ConnectButton } from "./connect-button";
import { ConnectionState } from "livekit-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  useConnectionState,
  useVoiceAssistant,
} from "@livekit/components-react";

import { useAgent } from "@/hooks/use-agent";
import { useConnection } from "@/hooks/use-connection";
import { useRecipe } from "@/hooks/use-recipe";
import { toast } from "@/hooks/use-toast";
import { GeminiVisualizer } from "@/components/visualizer/gemini-visualizer";
import { Button } from "@/components/ui/button";
import { StopCircle } from "lucide-react";

interface ChatProps {
  compact?: boolean;
  showControls?: boolean;
}

export function Chat({ compact = false, showControls = true }: ChatProps) {
  const connectionState = useConnectionState();
  const { audioTrack, state } = useVoiceAssistant();
  const [isChatRunning, setIsChatRunning] = useState(false);
  const { agent } = useAgent();
  const { disconnect } = useConnection();
  const { endCookingSession } = useRecipe();


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



  const renderVisualizer = () => (
    <div className="flex w-full items-center">
      <div className={compact ? "h-[120px] w-full" : "h-[280px] lg:h-[400px] mt-16 md:mt-0 lg:pb-24 w-full"}>
        <GeminiVisualizer agentState={state} agentTrackRef={audioTrack} />
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
    <div className={compact ? "flex flex-col h-full overflow-hidden p-2" : "flex flex-col h-full overflow-hidden p-2 lg:p-4"}>
      <div className="flex flex-col flex-grow items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center">
          {renderVisualizer()}
        </div>
        {showControls && (
          <div className={compact ? "space-y-2" : "space-y-3"}>
            {renderConnectionControl()}
            {/* End Session Button */}
            <div className="flex justify-center">
              <Button
                onClick={async () => {
                  try {
                    await disconnect();
                  } catch (error) {
                    console.error('Error disconnecting:', error);
                  }
                  endCookingSession();
                }}
                variant="destructive"
                size="sm"
                className="px-4"
              >
                <StopCircle className="mr-2 h-4 w-4" />
                End Session
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
