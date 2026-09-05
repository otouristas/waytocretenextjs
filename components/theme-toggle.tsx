"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function ThemeToggle({
  toLight,
  toDark,
  className,
}: {
  toLight: string;
  toDark: string;
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={dark ? toLight : toDark}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full text-ink ring-1 ring-line transition hover:bg-bg",
        className,
      )}
    >
      {mounted ? (
        dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />
      ) : (
        <span className="size-4" aria-hidden />
      )}
    </button>
  );
}
