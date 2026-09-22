import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import Home from "@/pages/v2/HomeV2";
import Login from "@/pages/Login";
import AppSplash from "@/components/AppSplash";
import UserLayout from "@/components/UserLayout";
import { Navigate } from "@/lib/router-compat";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Hkwallet — Earn Money Online With Easy Tasks" },
      {
        name: "description",
        content:
          "Download Hkwallet, complete simple tasks, get fast withdrawals and earn referral rebates every day.",
      },
      { property: "og:title", content: "Hkwallet — Earn Money Online With Easy Tasks" },
      {
        property: "og:description",
        content: "Download Hkwallet, complete simple tasks and earn referral rebates every day.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://hkwallet.online/social-preview.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://hkwallet.online/social-preview.jpg" },
    ],
  }),
  component: RootEntry,
});

// Plays on every app launch; in-app navigation back to "/" does not replay it.
let splashSeen = false;
/** Tiny extra wait so the first screen is already filled with data. */
const DATA_GRACE = 2500;

function RootEntry() {
  const { currentUser, loading } = useStore();
  const [startupSplash, setStartupSplash] = useState(() => !splashSeen);
  const [timeDone, setTimeDone] = useState(false);
  const [graceDone, setGraceDone] = useState(false);

  const finishSplash = useCallback(() => {
    setTimeDone(true);
  }, []);

  // The intro never waits on downloads: after its fixed 6s it only gives the
  // database a short grace period, then enters the app no matter what.
  useEffect(() => {
    if (!timeDone) return;
    const timer = window.setTimeout(() => setGraceDone(true), DATA_GRACE);
    return () => window.clearTimeout(timer);
  }, [timeDone]);

  useEffect(() => {
    if (startupSplash && timeDone && (!loading || graceDone)) {
      splashSeen = true;
      setStartupSplash(false);
    }
  }, [startupSplash, timeDone, loading, graceDone]);

  if (startupSplash) return <AppSplash onFinish={finishSplash} />;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0F8A5F] rounded-full animate-spin" />
      </div>
    );
  }



  if (!currentUser) {
    const ref =
      typeof window === "undefined"
        ? null
        : new URLSearchParams(window.location.search).get("ref");
    if (ref) return <Navigate to={`/download?ref=${encodeURIComponent(ref)}`} replace />;
    return <Login />;
  }
  if (currentUser.role !== "user") return <Navigate to="/admin" />;

  return (
    <UserLayout>
      <Home />
    </UserLayout>
  );
}
