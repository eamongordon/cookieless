"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

export type SiteSettingsNavItem = {
  name: string;
  href: string;
  segment: string | null;
};

export default function SiteSettingsNav({ navItems }: { navItems: SiteSettingsNavItem[] }) {
  const segment = useSelectedLayoutSegment();

  return (
    <div className="flex space-x-2 border-b border-muted-200 pb-4 pt-2">
      {navItems.map((item) => {
        const isActive =
          (item.segment == null && !segment) || segment === item.segment;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "px-2 py-1.5 rounded-lg text-sm font-medium transition-colors active:bg-accent",
              isActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}