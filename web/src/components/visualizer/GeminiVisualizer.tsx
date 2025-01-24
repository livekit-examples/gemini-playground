"use client";

import { GeminiMark } from "./GeminiMark";
import Logo from "@/assets/gemini.svg";

import {
  AgentState,
  TrackReference,
  useTrackVolume,
} from "@livekit/components-react";

type GeminiVisualizerProps = {
  agentState: AgentState;
  agentTrackRef?: TrackReference;
};

export default function GeminiVisualizer({
  agentTrackRef,
  agentState,
}: GeminiVisualizerProps) {
  const agentVolume = useTrackVolume(agentTrackRef);
  return (
    <div
      className="flex h-full w-full items-center justify-center relative"
      style={{
        perspective: "1000px",
      }}
    >
      <div className="absolute z-0 left-1/2 top-1/4 -translate-x-1/2 -translate-y-10 opacity-[0.025]">
        <Logo height="100" />
      </div>
      <GeminiMark volume={agentVolume} state={agentState} />
      <Shadow volume={agentVolume} state={agentState} />
    </div>
  );
}

const Shadow = ({ volume, state }: { volume: number; state?: AgentState }) => {
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
        className={`absolute transition-all duration-150 left-1/2 top-1/2 rounded-full`}
        style={{
          width: `200px`,
          height: `100px`,
          transform: `translate(-50%, calc(-50% + 50px)) scale(${1 + volume * 0.2})`,
          transformOrigin: "center",
          filter: `blur(30px) ${state === "disconnected" ? "saturate(0.0)" : "saturate(1.0)"}`,
          opacity: state === "disconnected" ? 0.15 : volume > 0 ? 0.4 : 0.15,
          background: "#5282ed",
        }}
      ></div>
    </div>
  );
};
