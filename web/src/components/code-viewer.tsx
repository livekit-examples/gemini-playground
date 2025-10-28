"use client";

import { Button } from "@/components/ui/button";
import { Rocket, ArrowUpRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import { playgroundStateHelpers } from "@/lib/playground-state-helpers";
import SyntaxHighlighter from "react-syntax-highlighter";
import { irBlack as theme } from "react-syntax-highlighter/dist/esm/styles/hljs";

export function CodeViewer() {
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<"python" | "typescript">("python");
  const { pgState } = usePlaygroundState();
  const fullInstructions = playgroundStateHelpers.getFullInstructions(pgState);

  const formatInstructions = (
    instructions: string,
    escapeMode: 'python' | 'typescript' = 'python',
    maxLineLength: number = 80
  ): string => {
    // Escape based on target language
    // Always escape backslashes first to prevent double-escaping issues
    let escaped: string;
    
    if (escapeMode === 'python') {
      // For Python triple-quoted strings: escape backslashes, then double quotes
      escaped = instructions
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"');
    } else {
      // For TypeScript template literals: escape backslashes, then backticks and dollar signs
      escaped = instructions
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$');
    }
    
    return escaped
      .split(/\s+/)
      .reduce(
        (lines, word) => {
          if ((lines[lines.length - 1] + " " + word).length <= maxLineLength) {
            lines[lines.length - 1] +=
              (lines[lines.length - 1] ? " " : "") + word;
          } else {
            lines.push(word);
          }
          return lines;
        },
        [""]
      )
      .join("\n");
  };

  const pythonCode = `from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli
from livekit.plugins import google

async def entrypoint(ctx: JobContext):
    await ctx.connect()

    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            model="${pgState.sessionConfig.model}",
            voice="${pgState.sessionConfig.voice}",
            temperature=${pgState.sessionConfig.temperature},${pgState.sessionConfig.maxOutputTokens !== null ? `
            max_output_tokens=${pgState.sessionConfig.maxOutputTokens},` : ''}
            modalities=${pgState.sessionConfig.modalities == "text_and_audio" ? '["TEXT", "AUDIO"]' : pgState.sessionConfig.modalities === "audio_only" ? '["AUDIO"]' : '["TEXT"]'},
        )
    )

    await session.start(
        room=ctx.room,
        agent=Agent(
            instructions="""${formatInstructions(fullInstructions)}"""
        )
    )

    await session.generate_reply(
        instructions="Greet the user and offer your assistance."
    )

${pgState.sessionConfig.nanoBananaEnabled ? `
# Image generation is enabled in this playground!
# To add image generation to your agent, see the full implementation:
# https://github.com/livekit-examples/gemini-playground/blob/main/agent/main.py
# 
# Key concepts:
# 1. Define function tools for the agent to call
# 2. Use Google's Gemini image generation API
# 3. Use LiveKit's stream_bytes to send images to the frontend
# 4. Receive byte streams on the frontend with registerByteStreamHandler
# 
# Learn more:
# - Gemini Image Generation: https://ai.google.dev/gemini-api/docs/image-generation
# - Function Tools: https://docs.livekit.io/agents/tools/
` : `
# Note: This example doesn't include image generation.
# The Gemini playground supports image generation via the "Nano Banana" toggle.
# Source code (Python example) available at: https://github.com/livekit-examples/gemini-playground/blob/main/agent/main.py
# 
# To learn how to add custom tools and byte stream communication:
# - Gemini Image Generation: https://ai.google.dev/gemini-api/docs/image-generation
# - Function Tools: https://docs.livekit.io/agents/tools/
`}

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
`;

  const typescriptCode = `import { defineAgent, type JobContext, WorkerOptions, cli, voice } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import { fileURLToPath } from 'node:url';
import { Modality } from '@google/genai';

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();

    const agent = new voice.Agent({
      instructions: \`${formatInstructions(fullInstructions, 'typescript')}\`,
    });

    const session = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: '${pgState.sessionConfig.model}',
        voice: '${pgState.sessionConfig.voice}',
        temperature: ${pgState.sessionConfig.temperature},${pgState.sessionConfig.maxOutputTokens !== null ? `
        maxOutputTokens: ${pgState.sessionConfig.maxOutputTokens},` : ''}
        modalities: ${pgState.sessionConfig.modalities == "text_and_audio" ? '[Modality.TEXT, Modality.AUDIO]' : pgState.sessionConfig.modalities === "audio_only" ? '[Modality.AUDIO]' : '[Modality.TEXT]'},
      }),
    });

    await session.start({
      agent,
      room: ctx.room,
    });

    await session.generateReply({
      instructions: 'Greet the user and offer your assistance.',
    });

${pgState.sessionConfig.nanoBananaEnabled ? `
    // Image generation is enabled in this playground!
    // To add image generation to your agent, see the full implementation:
    // https://github.com/livekit-examples/gemini-playground/blob/main/agent/main.py
    // 
    // Key concepts (good homework to deep dive into LiveKit btw!):
    // 1. Define function tools for the agent to call
    // 2. Use Google's Gemini image generation API
    // 3. Use LiveKit's stream_bytes or send_file to send images to the frontend
    // 4. Receive byte streams on the frontend with registerByteStreamHandler
    // 
    // Learn more:
    // - Gemini Image Generation: https://ai.google.dev/gemini-api/docs/image-generation
    // - Function Tools: https://docs.livekit.io/agents/tools/
    // - Byte Streams: https://docs.livekit.io/home/client/data/byte-streams/#handling-incoming-streams
` : `
    // Note: This example doesn't include image generation.
    // The Gemini playground supports image generation via the "Nano Banana" toggle.
    // Source code (Python example) available at: https://github.com/livekit-examples/gemini-playground/blob/main/agent/main.py
    // 
    // To learn how to add custom tools and byte stream communication:
    // - Gemini Image Generation: https://ai.google.dev/gemini-api/docs/image-generation
    // - Function Tools: https://docs.livekit.io/agents/tools/
    // - Byte Streams: https://docs.livekit.io/home/client/data/byte-streams/#handling-incoming-streams
`}
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
`;

  const currentCode = language === "python" ? pythonCode : typescriptCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDocsLink = () => {
    return language === "python"
      ? "https://github.com/livekit/agents"
      : "https://github.com/livekit/agents-js";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="primary" className="relative">
          <Rocket className="h-5 w-5" />
          <span className="sm:ml-2 hidden sm:block">Build with LiveKit</span>
          <span className="ml-2 sm:hidden">Build</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-6xl w-[90vw] sm:w-[95vw] flex flex-col mx-auto h-[85vh] sm:h-[90vh] max-h-[90vh] gap-0 p-0">
        <div className="flex flex-col border-b border-separator1 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <DialogHeader className="space-y-2 flex-1">
              <DialogTitle className="text-xl sm:text-2xl font-semibold text-fg0">
                Build your own AI Agent with LiveKit &amp; Gemini
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-fg2">
                Use the starter code below with{" "}
                <a
                  className="underline hover:text-fg1 transition-colors"
                  href={getDocsLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LiveKit Agents
                </a>{" "}
                to get started with the Gemini Live API.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-1 bg-bg2 p-1 rounded-lg sm:mr-10 flex-shrink-0 self-center sm:self-start mx-auto sm:mx-0">
              <Button
                variant={language === "python" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setLanguage("python")}
                className="px-2 sm:px-3 text-xs sm:text-sm"
              >
                Python
              </Button>
              <Button
                variant={language === "typescript" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setLanguage("typescript")}
                className="px-2 sm:px-3 text-xs sm:text-sm"
              >
                TypeScript
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden bg-bg0">
          <div className="relative flex-1 overflow-hidden group">
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg text-xs sm:text-sm"
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
            <div className="h-full overflow-auto [&>pre]:!m-0 [&>pre]:!p-4 sm:[&>pre]:!p-6 [&>pre]:!bg-[#000000] [&>pre]:h-full">
              <SyntaxHighlighter language={language === "typescript" ? "typescript" : "python"} style={theme} customStyle={{ margin: 0, padding: '1rem', background: '#000000' }}>
                {currentCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 border-t border-separator1 px-4 sm:px-6 py-4 bg-bg1">
          <Button 
            variant="primary"
            size="lg"
            leftIcon={<ArrowUpRight />}
            onClick={() => window.open('https://docs.livekit.io/agents', '_blank', 'noopener,noreferrer')}
            className="w-full sm:w-auto"
          >
            Get building!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
