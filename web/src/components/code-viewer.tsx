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
import SyntaxHighlighter from "react-syntax-highlighter";
import { irBlack as theme } from "react-syntax-highlighter/dist/esm/styles/hljs";

export function CodeViewer() {
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<"python" | "typescript">("python");
  const { pgState } = usePlaygroundState();

  const formatInstructions = (
    instructions: string,
    maxLineLength: number = 80
  ): string => {
    return instructions
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
            temperature=${pgState.sessionConfig.temperature},
            max_output_tokens=${pgState.sessionConfig.maxOutputTokens === null ? '"inf"' : pgState.sessionConfig.maxOutputTokens},
            modalities=${pgState.sessionConfig.modalities == "text_and_audio" ? '["text", "audio"]' : pgState.sessionConfig.modalities === "audio_only" ? '["audio"]' : '["text"]'},
        )
    )

    await session.start(
        room=ctx.room,
        agent=Agent(
            instructions="""${formatInstructions(pgState.instructions.replace(/"/g, '\\"'))}"""
        )
    )

    await session.generate_reply(
        instructions="Greet the user and offer your assistance."
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
`;

  const typescriptCode = `import { defineAgent, type JobContext, type JobProcess, WorkerOptions, cli, voice } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import { fileURLToPath } from 'node:url';

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();

    const agent = new voice.Agent({
      instructions: \`${formatInstructions(pgState.instructions.replace(/`/g, '\\`').replace(/\$/g, '\\$'))}\`,
    });

    const session = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: '${pgState.sessionConfig.model}',
        voice: '${pgState.sessionConfig.voice}',
        temperature: ${pgState.sessionConfig.temperature},
        maxOutputTokens: ${pgState.sessionConfig.maxOutputTokens === null ? 'Infinity' : pgState.sessionConfig.maxOutputTokens},
        modalities: ${pgState.sessionConfig.modalities == "text_and_audio" ? '["text", "audio"]' : pgState.sessionConfig.modalities === "audio_only" ? '["audio"]' : '["text"]'},
      }),
    });

    await session.start({
      agent,
      room: ctx.room,
    });

    await session.generateReply({
      instructions: 'Greet the user and offer your assistance.',
    });
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
      <DialogContent className="sm:max-w-6xl w-[95vw] flex flex-col mx-auto h-[90vh] max-h-[90vh] gap-0 p-0">
        <div className="flex flex-col border-b border-separator1 px-6 py-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <DialogHeader className="space-y-2 flex-1">
              <DialogTitle className="text-2xl font-semibold text-fg0">
                Build your own AI Agent with LiveKit &amp; Gemini
              </DialogTitle>
              <DialogDescription className="text-base text-fg2">
                Use the starter code below with{" "}
                <a
                  className="underline hover:text-fg1 transition-colors"
                  href={getDocsLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LiveKit Agents
                </a>{" "}
                to get started with the Gemini Multimodal Live API.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-1 bg-bg2 p-1 rounded-lg">
              <Button
                variant={language === "python" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setLanguage("python")}
                className="min-w-[80px]"
              >
                Python
              </Button>
              <Button
                variant={language === "typescript" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setLanguage("typescript")}
                className="min-w-[80px]"
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
              className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
            <div className="h-full overflow-auto [&>pre]:!m-0 [&>pre]:!p-6 [&>pre]:!bg-[#000000] [&>pre]:h-full">
              <SyntaxHighlighter language={language === "typescript" ? "typescript" : "python"} style={theme} customStyle={{ margin: 0, padding: '1.5rem', background: '#000000' }}>
                {currentCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 border-t border-separator1 px-6 py-4 bg-bg1">
          <Button 
            variant="primary"
            size="lg"
            leftIcon={<ArrowUpRight />}
            onClick={() => window.open('https://docs.livekit.io/agents', '_blank', 'noopener,noreferrer')}
          >
            Get building!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
