import { AccessToken } from "livekit-server-sdk";
import { RoomAgentDispatch, RoomConfiguration } from '@livekit/protocol';
import { PlaygroundState } from "@/data/playground-state";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "../.env.local") });

export async function POST(request: Request) {
  try {
    let playgroundState: PlaygroundState;

    try {
      playgroundState = await request.json();
    } catch (error) {
      return Response.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const {
      instructions,
      geminiAPIKey,
      sessionConfig: { model, modalities, voice, temperature, maxOutputTokens, nanoBananaEnabled },
    } = playgroundState;

    if (!geminiAPIKey) {
      return Response.json(
        { error: "Gemini API key is required" },
        { status: 400 }
      );
    }

    const roomName = Math.random().toString(36).slice(7);
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    if (!apiKey || !apiSecret) {
      throw new Error("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set");
    }

    // Create metadata for agent to start with
    const metadata = {
      instructions: instructions,
      model: model,
      modalities: modalities,
      voice: voice,
      temperature: temperature,
      max_output_tokens: maxOutputTokens,
      nano_banana_enabled: nanoBananaEnabled, // Send as boolean, not string
      gemini_api_key: geminiAPIKey,
    };
    
    // Create access token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: "human",
      metadata: JSON.stringify(metadata),
    });

    // Add room grants
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
      canUpdateOwnMetadata: true,
    });
    
    // Create room configuration + dispatch agent
    at.roomConfig = new RoomConfiguration({
      name: roomName,
      agents: [
        new RoomAgentDispatch({
          agentName: 'gemini-playground',
        }),
      ],
    });
    return Response.json({
      accessToken: await at.toJwt(),
      url: process.env.LIVEKIT_URL,
    });
  } catch (error) {
    return Response.json(
      { error: "Error generating token", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
