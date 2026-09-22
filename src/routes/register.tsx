import { createFileRoute } from "@tanstack/react-router";

import Register from "@/pages/Register";
import { RedirectIfAuthed } from "@/components/Guards";
import { Navigate, useLocation } from "@/lib/router-compat";

export const Route = createFileRoute("/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create Your Hkwallet Account" },
      {
        name: "description",
        content: "Register on Hkwallet with your mobile number and a referral code to start earning.",
      },
      { property: "og:title", content: "Create Your Hkwallet Account" },
      { property: "og:description", content: "Register on Hkwallet and start earning today." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterRoute,
});

function RegisterRoute() {
  const { search } = useLocation();
  const ref = new URLSearchParams(search).get("ref");
  if (ref) return <Navigate to={`/download?ref=${encodeURIComponent(ref)}`} replace />;
  return (
    <RedirectIfAuthed>
      <Register />
    </RedirectIfAuthed>
  );
}
