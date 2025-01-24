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
      <div className="absolute z-0 left-1/2 top-1/4 -translate-x-1/2 -translate-y-10 opacity-[0.008]">
        <Logo height="100" />
      </div>
      <GeminiMark volume={agentVolume} state={agentState} />
      <VolumeRings
        volume={agentVolume}
        count={25}
        separation={50}
        state={agentState}
      />
    </div>
  );
}

const VolumeRings = ({
  volume,
  count,
  separation,
  className,
  state,
}: {
  volume: number;
  count: number;
  separation: number;
  className?: string;
  state?: AgentState;
}) => {
  const increment = 1 / count;
  return (
    <div
      className="absolute z-0"
      style={{
        transform: "translateY(140px) rotate3d(1, 0, 0, 90deg)",
        transformStyle: "preserve-3d",
        zIndex: -1,
      }}
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`absolute transition-all duration-350 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 ${className} rounded-full`}
          style={{
            width: `${i * separation}px`,
            height: `${i * separation}px`,
            opacity:
              state === "speaking"
                ? volume - i * increment
                : Math.max(0, 1 - i * (increment * 1.25)),
            borderWidth: "6px",
            borderColor:
              state === "speaking" || i === -1
                ? "#5282ED"
                : "rgba(255, 255, 255, 0.05)",
          }}
        ></div>
      ))}
      <div
        className="absolute z-50 -translate-x-1/2 -translate-y-full left-0 top-0 bg-gradient-to-t from-transparent to-neutral-950"
        style={{
          width: `${count * separation}px`,
          height: `${count * separation}px`,
        }}
      ></div>
    </div>
  );
};
