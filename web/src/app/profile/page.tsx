import { Metadata } from "next";
import { ProfilePage } from "../../components/profile-page";
import { Header } from "@/components/header";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Profile - All You Can Cook";
  const description = "View your profile and cooking history on All You Can Cook.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://allyoucancock.app/profile",
      images: [
        {
          url: "https://allyoucancock.app/og-image.png",
          width: 1200,
          height: 676,
          type: "image/png",
          alt: title,
        },
      ],
    },
  };
}

export default function Profile() {
  return (
    <div className="flex flex-col h-dvh bg-background">
      <Header />
      <main className="flex flex-col flex-grow overflow-hidden">
        <ProfilePage />
      </main>
    </div>
  );
}
