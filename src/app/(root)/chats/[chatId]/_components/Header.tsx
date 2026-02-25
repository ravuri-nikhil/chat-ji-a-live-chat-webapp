import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { CircleArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
  imageUrl?: string;
  name: string;
};

export default function Header({ imageUrl, name }: Props) {
  return (
    <Card className="w-full flex rounded-lg p-2 justify-between">
      <div className="flex items-center gap-2">
        <Link href="/chats" className="block lg:hidden">
          <CircleArrowLeft />
        </Link>

        <Avatar className="w-8 h-8">
          <AvatarImage src={imageUrl} />
          <AvatarFallback>{name.substring(0, 1)}</AvatarFallback>
        </Avatar>
        <h2 className="font-semibold">{name}</h2>
      </div>
    </Card>
  );
}
