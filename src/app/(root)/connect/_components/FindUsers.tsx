import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useMutationState } from "@/hooks/useMutationState";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Props = {
  users: {
    _id: Id<"users">;
    _creationTime: number;
    email: string;
    username: string;
    imageUrl: string;
    clerkId: string;
  }[];
};

export default function FindUsers({ users }: Props) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState(query);
  const router = useRouter();

  const { mutate: createFriendship, pending: friendshipPending } =
    useMutationState(api.friend.createFriendship);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 500);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    const q = debounced.trim()?.toLowerCase();
    if (!q) return users;
    return users.filter((user) => {
      const name = user.username.trim();
      return name.toLowerCase().includes(q);
    });
  }, [users, debounced]);

  async function onUserClickHandler(id: Id<"users">) {
    const chatId = await createFriendship({ id });
    router.replace(`/chats/${chatId}`);
  }

  return (
    <>
      <Input
        type="search"
        placeholder="Search user by their name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="w-full flex flex-col justify-start items-center gap-1">
        {filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">No search results</div>
        ) : (
          filtered.map((user) => (
            <Card key={user._id} className="w-full p-1">
              <Button
                disabled={friendshipPending}
                className="flex justify-start items-center gap-4 truncate"
                onClick={async () => await onUserClickHandler(user._id)}
                variant={"outline"}
              >
                <Avatar>
                  <AvatarImage src={user.imageUrl} />
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start truncate">
                  <h4 className="truncate">{user.username}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </Button>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
