"use client";

import { useChat } from "@/hooks/useChat";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import Message from "./Message";

export default function Body() {
  const { chatId } = useChat();

  const messages = useQuery(api.messages.getMessages, {
    id: chatId as Id<"chats">,
  });

  return (
    <div className="flex-1 w-full flex overflow-y-scroll flex-col-reverse gap-2 p-3 no-scrollbar">
      {messages?.map(
        ({ message, senderImage, senderName, isCurrentUser }, index) => {
          const lastByUser =
            messages[index - 1]?.message.senderId ===
            messages[index].message.senderId;

          return (
            <Message
              key={message._id}
              createdAt={message._creationTime}
              type={message.type}
              content={message.content}
              fromCurrentUser={isCurrentUser}
              senderImage={senderImage}
              senderName={senderName}
              lastByUser={lastByUser}
            />
          );
        },
      )}
    </div>
  );
}
