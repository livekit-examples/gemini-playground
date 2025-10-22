import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  useMaybeRoomContext,
  useVoiceAssistant,
  useLocalParticipant,
} from "@livekit/components-react";
import {
  RoomEvent,
  TranscriptionSegment,
  Participant,
  TrackPublication,
  RemoteParticipant,
  type RpcInvocationData,
  DataPacket_Kind,
} from "livekit-client";
import { useConnection } from "@/hooks/use-connection";
import { useToast } from "@/hooks/use-toast";
import pako from "pako";
interface Transcription {
  segment: TranscriptionSegment;
  participant?: Participant;
  publication?: TrackPublication;
}

interface GeneratedImage {
  prompt: string;
  imageUrl: string;
  timestamp: number;
}

interface AgentContextType {
  displayTranscriptions: Transcription[];
  agent?: RemoteParticipant;
  generatedImages: GeneratedImage[];
}

type ImageMetadata = {
  prompt: string;
  timestamp: number;
  type: 'nano_banana_image';
  total_chunks?: number; 
};

type ImageChunksState = Record<string, string[]>; 

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const imageMetadataRef = useRef<ImageMetadata | undefined>(undefined);
  const [imageChunks, setImageChunks] = useState<ImageChunksState>({});
  const room = useMaybeRoomContext();
  const { shouldConnect } = useConnection();
  const { agent } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const [rawSegments, setRawSegments] = useState<{
    [id: string]: Transcription;
  }>({});
  const [displayTranscriptions, setDisplayTranscriptions] = useState<
    Transcription[]
  >([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!room) {
      return;
    }
    const updateRawSegments = (
      segments: TranscriptionSegment[],
      participant?: Participant,
      publication?: TrackPublication,
    ) => {
      setRawSegments((prev) => {
        const newSegments = { ...prev };
        for (const segment of segments) {
          newSegments[segment.id] = { segment, participant, publication };
        }
        return newSegments;
      });
    };
    room.on(RoomEvent.TranscriptionReceived, updateRawSegments);

    return () => {
      room.off(RoomEvent.TranscriptionReceived, updateRawSegments);
    };
  }, [room]);

  useEffect(() => {
    if (localParticipant) {
      localParticipant.registerRpcMethod(
        "pg.toast",
        async (data: RpcInvocationData) => {
          const { title, description, variant } = JSON.parse(data.payload);
          console.log(title, description, variant);
          toast({
            title,
            description,
            variant,
          });
          return JSON.stringify({ shown: true });
        },
      );
    }
  }, [localParticipant, toast]);

  // Listen for image data on data channel
  useEffect(() => {
    if (!room || !room.localParticipant) return;
    const handleDataReceived = (
      payload: Uint8Array,
      participant?: Participant,
      kind?: DataPacket_Kind,
      topic?: string
    ) => {
      if (!topic) {
        console.warn('Received data packet without topic');
        return;
      } 
    
      try {
        const textData = new TextDecoder().decode(payload);
    
        switch (topic) {
          case 'image_metadata': {
            const metadata = JSON.parse(textData) as ImageMetadata;
            imageMetadataRef.current = metadata;
            break;
          }
    
          case 'image_chunk': {
            const chunk = textData;
            if (!imageMetadataRef.current) {
              console.warn('Received chunk without metadata');
              return;
            }
            processImageChunk(chunk, imageMetadataRef.current);
            break;
          }
    
          default:
            console.warn(`Unknown topic received: ${topic}`);
        }
      } catch (error) {
        console.error('Error processing data:', error);
      }
    };
  
    
    const processImageChunk = (chunk: string, metadata: ImageMetadata) => {
      setImageChunks(prev => {
        const key = metadata.timestamp.toString();
        const updatedChunks = {
          ...prev,
          [key]: [...(prev[key] || []), chunk]
        };
    
        if (metadata.total_chunks && updatedChunks[key].length === metadata.total_chunks) {
          const fullBase64 = updatedChunks[key].join('');
          processFullImage(metadata, fullBase64);
          const { [key]: _, ...rest } = updatedChunks; // Remove processed chunks
          return rest;
        }
        return updatedChunks;
      });
    };
    
    const processFullImage = (metadata: ImageMetadata, base64Image: string) => {
      try {
        const gzippedBytes = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
        const decompressed = pako.ungzip(gzippedBytes);
        const blob = new Blob([decompressed], { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(blob);
    
        setGeneratedImages(prev => [
          ...prev,
          {
            prompt: metadata.prompt,
            imageUrl,
            timestamp: metadata.timestamp
          }
        ]);
      } catch (error) {
        console.error('Failed to decompress image:', error);
      }
    };
    
    const dataHandler = (payload: Uint8Array, participant?: Participant, kind?: DataPacket_Kind, topic?: string) => 
      handleDataReceived(payload, participant, kind, topic);

    room.on(RoomEvent.DataReceived, dataHandler);

    return () => {
      room.off(RoomEvent.DataReceived, dataHandler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  useEffect(() => {
    const sorted = Object.values(rawSegments).sort(
      (a, b) =>
        (a.segment.firstReceivedTime ?? 0) - (b.segment.firstReceivedTime ?? 0),
    );
    const mergedSorted = sorted.reduce((acc, current) => {
      if (acc.length === 0) {
        return [current];
      }

      const last = acc[acc.length - 1];
      if (
        last.participant === current.participant &&
        last.participant?.isAgent &&
        (current.segment.firstReceivedTime ?? 0) -
        (last.segment.lastReceivedTime ?? 0) <=
        1000 &&
        !last.segment.id.startsWith("status-") &&
        !current.segment.id.startsWith("status-")
      ) {
        // Merge segments from the same participant if they're within 1 second of each other
        return [
          ...acc.slice(0, -1),
          {
            ...current,
            segment: {
              ...current.segment,
              text: `${last.segment.text} ${current.segment.text}`,
              id: current.segment.id, // Use the id of the latest segment
              firstReceivedTime: last.segment.firstReceivedTime, // Keep the original start time
            },
          },
        ];
      } else {
        return [...acc, current];
      }
    }, [] as Transcription[]);
    setDisplayTranscriptions(mergedSorted);
  }, [rawSegments]);

  useEffect(() => {
    if (shouldConnect) {
      setRawSegments({});
      setDisplayTranscriptions([]);
      setGeneratedImages([]);
    }
  }, [shouldConnect]);

  return (
    <AgentContext.Provider value={{ displayTranscriptions, agent, generatedImages }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return context;
}
