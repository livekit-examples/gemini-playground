"use client";

import { GeminiMark } from "@/components/visualizer/gemini-mark";

import {
  AgentState,
  TrackReference,
  useTrackVolume,
} from "@livekit/components-react";
import { useTheme } from "@/components/theme-provider";

type GeminiVisualizerProps = {
  agentState: AgentState;
  agentTrackRef?: TrackReference;
};

export function GeminiVisualizer({
  agentTrackRef,
  agentState,
}: GeminiVisualizerProps) {
  const agentVolume = useTrackVolume(agentTrackRef);
  const { theme } = useTheme();
  
  return (
    <div
      className="flex h-full w-full relative"
      style={{
        perspective: "1000px",
      }}
    >
      <GeminiMark volume={agentVolume} state={agentState} />
    </div>
  );
}

const Shadow = ({ volume, state, theme }: { volume: number; state?: AgentState; theme: string }) => {
  const shadowColor = theme === "light" ? "bg-amber-600" : "bg-gemini-blue";
  
  return (
    <div
      className="absolute z-0"
      style={{
        transform: "translateX(120px) translateY(70px) rotate3d(1, 0, 0, 80deg)",
        transformStyle: "preserve-3d",
        zIndex: -1,
      }}
    >
      <div
        className={`absolute w-[200px] h-[100px] transition-all duration-150 left-1/2 top-1/2 rounded-full ${shadowColor}`}
        style={{
          transform: `translate(-50%, calc(-50% + 50px)) scale(${state === "disconnected" ? 0.6 : 0.75 + volume * 0.1})`,
          filter: `blur(30px) ${state === "disconnected" ? "saturate(0.0)" : "saturate(1.0)"}`,
          opacity: state === "disconnected" ? 0.05 : volume > 0 ? 0.4 : 0.15,
        }}
      ></div>
    </div>
  );
};
