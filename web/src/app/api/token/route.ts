import { AccessToken } from "livekit-server-sdk";
import { RoomAgentDispatch, RoomConfiguration } from '@livekit/protocol';
import { PlaygroundState } from "@/data/playground-state";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "../.env.local") });

export async function POST(request: Request) {
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
  const agentId = process.env.LIVEKIT_AGENT_ID;
  if (!apiKey || !apiSecret || !agentId) {
    throw new Error("LIVEKIT_API_KEY, LIVEKIT_API_SECRET and LIVEKIT_AGENT_ID must be set");
  }

  const metadata = {
    instructions: instructions,
    model: model,
    modalities: modalities,
    voice: voice,
    temperature: temperature,
    max_output_tokens: maxOutputTokens,
    nano_banana_enabled: Boolean(nanoBananaEnabled),
    gemini_api_key: String(geminiAPIKey),
  };

  const at = new AccessToken(apiKey, apiSecret, {
    identity: "human",
    metadata: JSON.stringify(metadata),
  });
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
    canUpdateOwnMetadata: true,
  });
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
}
