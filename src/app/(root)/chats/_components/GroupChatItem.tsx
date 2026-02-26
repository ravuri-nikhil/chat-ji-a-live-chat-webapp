import { Id } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Props = {
  id: Id<"chats">;
  name: string;
  lastMessageSender?: string;
  lastMessageContent?: string;
};

export default function GroupChatItem({
  id,
  name,
  lastMessageContent,
  lastMessageSender,
}: Props) {
  return (
    <Link href={`/chats/${id}`} className="w-full">
      <Card className="px-2 py-1 flex flex-row items-center gap-4 truncate">
        <div className="flex flex-row items-center gap-4 truncate">
          <Avatar>
            <AvatarFallback>
              {name.charAt(0).toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col truncate">
            <h4 className="truncate">{name}</h4>
            {lastMessageSender && lastMessageContent ? (
              <span className="text-sm text-muted-foreground truncate flex overflow-ellipsis">
                <p className="font-semibold">
                  {lastMessageSender}
                  {":"}&nbsp;
                </p>
                <p className="truncate overflow-ellipsis">
                  {lastMessageContent}
                </p>
              </span>
            ) : (
              <p className="text-sm text-muted-foreground truncate">
                Start the chat!
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
