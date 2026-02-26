"use client";
import ItemList from "@/components/shared/item-list/ItemList";
import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../../convex/_generated/api";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import DMChatItem from "./_components/DMChatItem";
import CreateGroupDialog from "./_components/CreateGroupDialog";
import GroupChatItem from "./_components/GroupChatItem";

type Props = React.PropsWithChildren<object>;

export default function ChatsLayout({ children }: Props) {
  const chats = useQuery(api.chats.getAllChats);

  return (
    <>
      <ItemList title="Chats" action={<CreateGroupDialog />}>
        {chats ? (
          chats.length === 0 ? (
            <Card className="w-full h-[calc(100%-50px)] flex items-center justify-center bg-accent text-accent-foreground">
              No Chats Yet
            </Card>
          ) : (
            chats.map((chat) => {
              return chat.chat.isGroup ? (
                <GroupChatItem
                  key={chat.chat._id}
                  id={chat.chat._id}
                  name={chat.chat.name || ""}
                  lastMessageContent={chat.lastMessage?.content}
                  lastMessageSender={chat.lastMessage?.sender}
                />
              ) : (
                <DMChatItem
                  key={chat.chat._id}
                  id={chat.chat._id}
                  username={chat.otherMember?.username || ""}
                  imageUrl={chat.otherMember?.imageUrl || ""}
                  lastMessageContent={chat.lastMessage?.content}
                  lastMessageSender={chat.lastMessage?.sender}
                />
              );
            })
          )
        ) : (
          <Loader2 className="animate-spin duration-500" />
        )}
      </ItemList>
      {children}
    </>
  );
}
