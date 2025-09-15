"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Mic, MicOff } from "lucide-react";
import { useEffect, useState } from "react";

import {
  TrackToggle,
  BarVisualizer,
  useLocalParticipant,
  useMediaDeviceSelect,
} from "@livekit/components-react";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import { Track } from "livekit-client";

import { useConnection } from "@/hooks/use-connection";

export function SessionControls() {
  const localParticipant = useLocalParticipant();
  const deviceSelect = useMediaDeviceSelect({ kind: "audioinput" });
  const { disconnect } = useConnection();

  const [isMuted, setIsMuted] = useState(localParticipant.isMicrophoneEnabled);
  const { isNoiseFilterEnabled, isNoiseFilterPending, setNoiseFilterEnabled } =
    useKrispNoiseFilter();
  useEffect(() => {
    setNoiseFilterEnabled(true);
  }, [setNoiseFilterEnabled]);
  useEffect(() => {
    setIsMuted(localParticipant.isMicrophoneEnabled === false);
  }, [localParticipant.isMicrophoneEnabled]);

  return (
    <div className="flex flex-row gap-2">
      <div className="flex items-center rounded-md bg-card border border-border text-card-foreground">
        <div className="flex items-center gap-2">
          <TrackToggle
            source={Track.Source.Microphone}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-l-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-card-foreground hover:!bg-accent hover:!rounded-l-md h-9 shadow-none !px-3 !border-r-[1px] !border-border`}
            style={{ borderRightStyle: "solid" }}
            showIcon={false}
          >
            {isMuted ? (
              <MicOff className="text-muted-foreground h-4 w-4" />
            ) : (
              <Mic className="text-foreground h-4 w-4" />
            )}
          </TrackToggle>
          <BarVisualizer
            className="!h-6 pl-2 pr-4"
            state="speaking"
            barCount={7}
            trackRef={{
              participant: localParticipant.localParticipant,
              publication: localParticipant.microphoneTrack,
              source: Track.Source.Microphone,
            }}
          >
          </BarVisualizer>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="px-2.5 bg-card shadow-none hover:bg-accent rounded-l-none border-l-[1px] border-border text-sm font-semibold text-card-foreground"
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            alignOffset={-5}
            className="w-[320px]"
            forceMount
          >
            <DropdownMenuLabel className="text-xs uppercase tracking-widest">
              Available inputs
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {deviceSelect.devices.map((device, index) => (
              <DropdownMenuCheckboxItem
                key={`device-${index}`}
                className="text-xs"
                checked={device.deviceId === deviceSelect.activeDeviceId}
                onCheckedChange={() =>
                  deviceSelect.setActiveMediaDevice(device.deviceId)
                }
              >
                {device.label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs uppercase tracking-widest">
              Audio Settings
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              className="text-xs"
              checked={isNoiseFilterEnabled}
              onCheckedChange={async (checked) => {
                setNoiseFilterEnabled(checked);
              }}
              disabled={isNoiseFilterPending}
            >
              Enhanced Noise Filter
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button variant="outline" size="sm" className="px-4" onClick={disconnect}>
        Pause Conversation
      </Button>
    </div>
  );
}
