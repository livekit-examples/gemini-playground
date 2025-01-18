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

  const pythonCode = `from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, WorkerType, cli, multimodal
from livekit.plugins import google

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    agent = multimodal.MultimodalAgent(
        model=google.beta.realtime.RealtimeModel(
            instructions="""${formatInstructions(pgState.instructions.replace(/"/g, '\\"'))}""",
            voice="${pgState.sessionConfig.voice}",
            temperature=${pgState.sessionConfig.temperature},
            max_response_output_tokens=${pgState.sessionConfig.maxOutputTokens === null ? '"inf"' : pgState.sessionConfig.maxOutputTokens},
            modalities=${pgState.sessionConfig.modalities == "text_and_audio" ? '["TEXT", "AUDIO"]' : pgState.sessionConfig.modalities === "audio_only" ? '["AUDIO"]' : '["TEXT"]'},
        )
    )
    agent.start(ctx.room)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, worker_type=WorkerType.ROOM))
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
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
      <DialogContent className="sm:max-w-6xl w-[95vw] flex flex-col mx-auto h-[90vh] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            Build your own AI Agent with LiveKit &amp; Gemini
          </DialogTitle>
          <DialogDescription>
            Use the starter code below with{" "}
            <a
              className="underline"
              href={getDocsLink()}
              target="_blank"
              rel="noopener noreferrer"
            >
              LiveKit Agents
            </a>{" "}
            to get started with the Gemini Multimodal Live API.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-full overflow-hidden">
          <Button
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-white hover:text-black bg-white text-black"
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
          <div className="h-full overflow-auto">
            <SyntaxHighlighter language={language} style={theme}>
              {pythonCode}
            </SyntaxHighlighter>
          </div>
        </div>
        <div className="mt-4 flex justify-end flex-shrink-0">
          <Button asChild variant="default">
            <a href="https://docs.livekit.io/agents" target="_blank">
              <ArrowUpRight className="h-5 w-5 mr-2" />
              Get building!
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
