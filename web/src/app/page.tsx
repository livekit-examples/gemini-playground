import { Metadata } from "next";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { RoomComponent } from "@/components/room-component";
import LK from "@/components/lk";
import Gemini from "@/components/gemini";
import Heart from "@/assets/heart.svg";
import { defaultPresets } from "@/data/presets";
import { CodeViewer } from "@/components/code-viewer";
import { PresetSave } from "@/components/preset-save";
import { PresetSelector } from "@/components/preset-selector";
import { PresetShare } from "@/components/preset-share";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  let title = "LiveKit | Gemini Multimodal Playground";
  let description =
    "Speech-to-speech playground for Google's new Gemini Multimodal Live API. Built on LiveKit Agents.";

  const presetId = searchParams?.preset;
  if (presetId) {
    const selectedPreset = defaultPresets.find(
      (preset) => preset.id === presetId
    );
    if (selectedPreset) {
      title = `Gemini Multimodal Live Playground`;
      description = `Speak to a "${selectedPreset.name}" in a speech-to-speech playground for Gemini's new Multimodal Live API. Built on LiveKitAgents.`;
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
    <div className="flex flex-col h-dvh bg-neutral-900">
      <header className="flex flex-col md:flex-row flex-shrink-0 gap-3 md:h-12 items-center justify-between px-5 py-8 w-full md:mx-auto">
        <div className="flex items-center gap-3">
          <LK />
          <span className="h-8 border-r border-white/10"></span>
          <div className="flex gap-2 items-center">
            <Gemini />
            <span className="text-[18px] pt-[3px] font-light">
              Multimodal Live Playground
            </span>
          </div>
        </div>
        <div className="inline-flex flex-row items-center space-x-2">
          <PresetSelector />
          <PresetSave />
          <PresetShare />
          <CodeViewer />
        </div>
      </header>
      <main className="flex flex-col flex-grow overflow-hidden p-0 pb-4 lg:pb-0 w-full md:mx-auto">
        <RoomComponent />
      </main>
      <footer className="hidden md:flex md:items-center md:gap-2 md:justify-end font-mono uppercase text-right py-3 px-8 text-xs text-neutral-600 w-full md:mx-auto">
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
