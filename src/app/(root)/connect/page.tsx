"use client";
import ChatFallback from "@/components/shared/chat/ChatFallback";
import ItemList from "@/components/shared/item-list/ItemList";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loader2 } from "lucide-react";
import FindUsers from "./_components/FindUsers";
import { Card } from "@/components/ui/card";

type Props = object;

export default function ConnectPage({}: Props) {
  const users = useQuery(api.users.getAllExceptMe);
  return (
    <>
      <ItemList title="Connect">
        {users ? (
          users.length === 0 ? (
            <Card className="w-full h-[calc(100%-50px)] flex items-center justify-center bg-accent text-accent-foreground">
              No Registered User Found
            </Card>
          ) : (
            <FindUsers users={users} />
          )
        ) : (
          <Loader2 className="w-8 h-8 animate-spin duration-500" />
        )}
      </ItemList>
      <ChatFallback />
    </>
  );
}
