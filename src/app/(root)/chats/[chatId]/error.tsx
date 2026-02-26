"use client";

import ChatFallback from "@/components/shared/chat/ChatFallback";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error({ error }: { error: Error }) {
  const router = useRouter();

  useEffect(() => {
    router.replace("/chats");
  }, [error, router]);

  return <ChatFallback />;
}
