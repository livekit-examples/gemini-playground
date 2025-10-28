"use client";

import { GeminiMark } from "@/components/visualizer/gemini-mark";
import Logo from "@/assets/gemini.svg";
import { useTheme } from "next-themes";

import {
  AgentState,
  TrackReference,
  useTrackVolume,
} from "@livekit/components-react";

type GeminiVisualizerProps = {
  agentState: AgentState;
  agentTrackRef?: TrackReference;
};

export function GeminiVisualizer({
  agentTrackRef,
  agentState,
}: GeminiVisualizerProps) {
  const agentVolume = useTrackVolume(agentTrackRef);
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = theme === "system" ? resolvedTheme : theme;
  
  return (
    <div
      className="flex h-full w-full items-center justify-center relative"
      style={{
        perspective: "1000px",
      }}
    >
      <div className="absolute z-0 left-1/2 top-1/4 -translate-x-1/2 -translate-y-10 opacity-[0.05]" >
        <Logo height="64" />
      </div>
      <GeminiMark volume={agentVolume} state={agentState} />
      <Shadow volume={agentVolume} state={agentState} theme={currentTheme} />
    </div>
  );
}

const Shadow = ({ volume, state, theme }: { volume: number; state?: AgentState; theme?: string }) => {
  // Adjust shadow opacity based on theme
  const disconnectedOpacity = theme === "light" ? 0.15 : 0.2;
  const idleOpacity = theme === "light" ? 0.12 : 0.15;
  
  return (
    <div
      className="absolute z-0"
      style={{
        transform: "translateY(140px) rotate3d(1, 0, 0, 80deg)",
        transformStyle: "preserve-3d",
        zIndex: -1,
      }}
    >
      <div
        className={`absolute w-[200px] h-[100px] transition-all duration-150 left-1/2 top-1/2 rounded-full bg-gemini-blue`}
        style={{
          transform: `translate(-50%, calc(-50% + 50px)) scale(${state === "disconnected" ? 0.6 : 0.75 + volume * 0.1})`,
          filter: `blur(30px) ${state === "disconnected" ? "saturate(0.3)" : "saturate(1.0)"}`,
          opacity: state === "disconnected" ? disconnectedOpacity : volume > 0 ? 0.4 : idleOpacity,
        }}
      ></div>
    </div>
  );
};
