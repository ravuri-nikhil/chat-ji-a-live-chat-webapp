import { MessageSquare, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export function useNavigation() {
  const pathname = usePathname();
  const paths = useMemo(
    () => [
      {
        name: "Chats",
        href: "/chats",
        icon: MessageSquare,
        active: pathname.startsWith("/chats"),
      },
      {
        name: "Connect",
        href: "/connect",
        icon: Users,
        active: pathname.startsWith("/connect"),
      },
    ],
    [pathname],
  );

  return paths;
}
