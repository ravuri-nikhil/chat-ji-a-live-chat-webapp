import { Card } from "@/components/ui/card";

type Props = React.PropsWithChildren<object>;

export default function ChatContainer({ children }: Props) {
  return (
    <Card className="w-full h-[calc(100vh-32px)] lg:h-full p-2 flex flex-col ap-2">
      {children}
    </Card>
  );
}
