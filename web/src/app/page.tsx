import { Metadata } from "next";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Chat } from "@/components/chat";
import Heart from "@/assets/heart.svg";
import { defaultPresets } from "@/data/presets";
import { CodeViewer } from "@/components/code-viewer";
import { PresetSave } from "@/components/preset-save";
import { PresetSelector } from "@/components/preset-selector";
import { PresetShare } from "@/components/preset-share";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  let title = "LiveKit | Gemini Live API Playground";
  let description =
    "Speech-to-speech playground for Google's new Gemini Live API. Built on LiveKit Agents";

  const params = await searchParams;
  const presetId = params?.preset;
  if (presetId) {
    const selectedPreset = defaultPresets.find(
      (preset) => preset.id === presetId
    );
    if (selectedPreset) {
      title = `Gemini Live API Playground`;
      description = `Speak to a "${selectedPreset.name}" in a speech-to-speech playground for Gemini's new Live API. Built on LiveKitAgents.`;
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://gemini-playground-xi.vercel.app/",
      images: [
        {
          url: "https://gemini-playground-xi.vercel.app/og-image.png",
          width: 1200,
          height: 676,
          type: "image/png",
          alt: title,
        },
      ],
    },
  };
}

export default function Dashboard() {
  return (
    <div className="flex flex-col h-screen bg-bg0 overflow-x-hidden">
      <header className="flex flex-col md:flex-row flex-shrink-0 gap-3 md:h-16 items-center justify-between px-4 md:px-8 py-4 w-full border-b border-separator1 min-w-0">
        <div className="flex items-center min-w-0 flex-shrink">
          <span className="text-lg font-light truncate">
            Gemini Live API Playground
          </span>
        </div>
        <div className="inline-flex flex-row items-center space-x-2 flex-shrink-0">
          <PresetSelector />
          <PresetSave />
          <PresetShare />
          <CodeViewer />
        </div>
      </header>
      <main className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden p-4 w-full">
        <div className="w-full h-full flex flex-col mx-auto rounded-2xl bg-bg1 border border-separator1 min-w-0 overflow-hidden">
          <Chat />
        </div>
      </main>
      <footer className="hidden md:flex md:items-center md:gap-2 md:justify-end font-mono uppercase text-right py-3 px-8 text-xs text-fg3 w-full border-t border-separator1">
        Built with
        <Heart />
        on
        <a
          href="https://github.com/livekit/agents"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          LiveKit Agents
        </a>{" "}
        •
        <a
          href="https://github.com/livekit-examples/gemini-playground"
          target="_blank"
          rel="noopener noreferrer"
          className="underline inline-flex items-center gap-1"
        >
          <GitHubLogoIcon className="h-4 w-4" />
          View source on GitHub
        </a>
        • © 2025 LiveKit
      </footer>
    </div>
  );
}
