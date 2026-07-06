"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackHeaderProps {
  title?: string;
  href?: string;
  rightSlot?: React.ReactNode;
}

export function BackHeader({ title, href, rightSlot }: BackHeaderProps) {
  const router = useRouter();

  function handleBack() {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  }

  return (
    <div className="sticky top-0 z-20 -mx-4 flex h-14 items-center gap-2 border-b bg-background/95 px-2 pt-[max(env(safe-area-inset-top),0px)] backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
      <button
        onClick={handleBack}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors active:scale-90 md:hidden"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      {title && (
        <h1 className="min-w-0 flex-1 truncate text-lg font-bold md:text-2xl">{title}</h1>
      )}
      {rightSlot && <div className="ml-auto flex shrink-0 items-center gap-2">{rightSlot}</div>}
    </div>
  );
}
