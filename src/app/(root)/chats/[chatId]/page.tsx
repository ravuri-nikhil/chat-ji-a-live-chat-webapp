"use client";
import ChatContainer from "@/components/shared/chat/ChatContainer";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import Header from "./_components/Header";
import Body from "./_components/body/Body";
import ChatInput from "./_components/input/ChatInput";
import { useParams } from "next/navigation";
import { useState } from "react";
import RemoveFriendDialog from "./_components/dialogs/RemoveFriendDialog";
import DeleteGroupDialog from "./_components/dialogs/DeleteGroupDialog";
import LeaveGroupDialog from "./_components/dialogs/LeaveGroupDialog";

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: Id<"chats"> }>();

  const chat = useQuery(api.chat.getChat, { id: chatId });

  const [removeFriendDialogOpen, setRemoveFriendDialogOpen] = useState(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] = useState(false);

  return chat === undefined ? (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="animate-spin duration-500 h-8 w-8" />
    </div>
  ) : chat === null ? (
    <p className="w-full h-full flex items-center justify-center">
      Chat Not Found
    </p>
  ) : (
    <ChatContainer>
      <RemoveFriendDialog
        chatId={chatId}
        open={removeFriendDialogOpen}
        setOpen={setRemoveFriendDialogOpen}
      />
      <LeaveGroupDialog
        chatId={chatId}
        open={leaveGroupDialogOpen}
        setOpen={setLeaveGroupDialogOpen}
      />
      <DeleteGroupDialog
        chatId={chatId}
        open={deleteGroupDialogOpen}
        setOpen={setDeleteGroupDialogOpen}
      />
      <Header
        imageUrl={chat.isGroup ? undefined : chat.otherMember?.imageUrl}
        name={(chat.isGroup ? chat.name : chat.otherMember?.username) || ""}
        options={
          chat.isGroup
            ? [
                {
                  label: "Leave group",
                  destructive: false,
                  onClick: () => setLeaveGroupDialogOpen(true),
                },
                {
                  label: "Delete group",
                  destructive: true,
                  onClick: () => setDeleteGroupDialogOpen(true),
                },
              ]
            : [
                {
                  label: "Remove friend",
                  destructive: true,
                  onClick: () => setRemoveFriendDialogOpen(true),
                },
              ]
        }
      />
      <Body />
      <ChatInput />
    </ChatContainer>
  );
}
