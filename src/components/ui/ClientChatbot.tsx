"use client";

import dynamic from "next/dynamic";

const AIChatbot = dynamic(() => import("@/components/ui/AIChatbot"), {
  ssr: false,
});

export default function ClientChatbot() {
  return <AIChatbot />;
}
