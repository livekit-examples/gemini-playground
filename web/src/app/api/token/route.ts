import { AccessToken } from "livekit-server-sdk";
import { PlaygroundState } from "@/data/playground-state";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "../.env.local") });

export async function POST(request: Request) {
  let playgroundState: PlaygroundState;

  try {
    playgroundState = await request.json();
    console.log('🔗 Token API received instructions:', {
      instructionsLength: playgroundState.instructions.length,
      hasRecipeContext: playgroundState.instructions.includes('CURRENT COOKING SESSION'),
      preview: playgroundState.instructions.substring(0, 150) + '...'
    });
  } catch (error) {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const {
    instructions,
    sessionConfig: { modalities, voice, temperature, maxOutputTokens },
  } = playgroundState;

  // Use environment variable for Gemini API key
  const geminiAPIKey = process.env.GEMINI_API_KEY;
  if (!geminiAPIKey) {
    console.error("GEMINI_API_KEY environment variable is not set");
    return Response.json(
      { error: "Server configuration error: Gemini API key not configured" },
      { status: 500 }
    );
  }

  const roomName = Math.random().toString(36).slice(7);
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set");
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: "human",
    metadata: JSON.stringify({
      instructions: instructions,
      modalities: modalities,
      voice: voice,
      temperature: temperature,
      max_output_tokens: maxOutputTokens,
      gemini_api_key: geminiAPIKey,
    }),
  });
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
    canUpdateOwnMetadata: true,
  });
  return Response.json({
    accessToken: await at.toJwt(),
    url: process.env.LIVEKIT_URL,
  });
}
