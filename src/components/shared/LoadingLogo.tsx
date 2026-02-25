import Image from "next/image";

type Props = { size?: number };

export default function LoadingLogo({ size = 100 }: Props) {
  return (
    <div className="h-full w-full flex justify-center items-center">
      <Image
        src={"icon.svg"}
        alt="loading logo"
        width={size}
        height={size}
        className="animate-pulse duration-800"
      />
    </div>
  );
}
