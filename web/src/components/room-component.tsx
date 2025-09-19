"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";

import { Chat } from "@/components/chat";
import { RecipeSelector } from "@/components/recipe-selector";
import { CookingSession } from "@/components/cooking-session";
import { RecipeCompletionSummary } from "@/components/recipe-completion-summary";
import { useConnection } from "@/hooks/use-connection";
import { useRecipe } from "@/hooks/use-recipe";
import { AgentProvider } from "@/hooks/use-agent";

export function RoomComponent() {
  const { shouldConnect, wsUrl, token } = useConnection();
  const { currentRecipe, cookingSession, endCookingSession } = useRecipe();

  // Show cooking session if active
  const showCookingSession = currentRecipe && cookingSession && cookingSession.status === 'active';
  // Show completion page if session is completed
  const showCompletionPage = currentRecipe && cookingSession && cookingSession.status === 'completed';

  const handleCompletionExit = () => {
    // Clear the cooking session and return to home
    endCookingSession();
  };
  
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
        {/* Main content area */}
        <div className="flex flex-col flex-grow rounded-2xl bg-card border border-border overflow-hidden">
          {showCookingSession ? (
            // Show cooking session interface - optimized for single screen
            <div className="flex flex-col h-full">
              {/* Cooking session takes most space but leaves room for chat */}
              <div className="flex-1 overflow-y-auto p-2 min-h-0">
                <CookingSession />
              </div>
              {/* Compact chat area at bottom - just the visualizer, no controls */}
              <div className="flex-shrink-0 border-t border-border">
                <Chat compact showControls={true} />
              </div>
            </div>
          ) : showCompletionPage ? (
            // Show recipe completion page
            <div className="flex-1 overflow-y-auto p-2">
              <RecipeCompletionSummary onExit={handleCompletionExit} />
            </div>
          ) : (
            // Show recipe selection or chat
            <div className="flex flex-col h-full">
              {!shouldConnect ? (
                // Show recipe selector when not connected
                <div className="flex-1 overflow-y-auto p-2">
                  <RecipeSelector />
                </div>
              ) : (
                // Show full chat when connected but no recipe
                <Chat />
              )}
            </div>
          )}
        </div>
        <RoomAudioRenderer />
        <StartAudio label="Click to allow audio playback" />
      </AgentProvider>
    </LiveKitRoom>
  );
}
