import { createFileRoute } from "@tanstack/react-router";

import Landing from "@/pages/Landing";

export const Route = createFileRoute("/download")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Download Hkwallet APK — Start Earning Today" },
      {
        name: "description",
        content:
          "Download the Hkwallet Android app, complete easy tasks and withdraw your earnings quickly.",
      },
      { property: "og:title", content: "Download Hkwallet APK — Start Earning Today" },
      {
        property: "og:description",
        content: "Get the Hkwallet app and start earning with simple daily tasks.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://hkwallet.online/social-preview.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://hkwallet.online/social-preview.jpg" },
    ],
  }),
  component: Landing,
});
