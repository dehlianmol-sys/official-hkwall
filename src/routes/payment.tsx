import { createFileRoute } from "@tanstack/react-router";

import PaymentClaimsV2 from "@/pages/v2/PaymentClaimsV2";
import { RequireUser } from "@/components/Guards";
import UserLayout from "@/components/UserLayout";

export const Route = createFileRoute("/payment")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Payment Claims — Hkwallet" },
      { name: "description", content: "Claim INR payment orders on Hkwallet and earn cashback on every completed payment." },
      { property: "og:title", content: "Payment Claims — Hkwallet" },
      { property: "og:description", content: "Claim INR payment orders on Hkwallet and earn cashback." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireUser>
      <UserLayout><PaymentClaimsV2 /></UserLayout>
    </RequireUser>
  ),
});
