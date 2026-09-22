import { createFileRoute } from "@tanstack/react-router";

import OrderPayV2 from "@/pages/v2/OrderPayV2";
import { RequireUser } from "@/components/Guards";

export const Route = createFileRoute("/order")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Order Payment — Hkwallet" },
      { name: "description", content: "Pay your Hkwallet order with bank transfer and upload the payment voucher." },
      { property: "og:title", content: "Order Payment — Hkwallet" },
      { property: "og:description", content: "Pay your Hkwallet order and upload the payment voucher." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireUser>
      <OrderPayV2 />
    </RequireUser>
  ),
});
