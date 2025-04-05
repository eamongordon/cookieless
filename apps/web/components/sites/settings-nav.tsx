"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useSelectedLayoutSegment } from "next/navigation";

export default function SiteSettingsNav() {
  const { id } = useParams() as { id?: string };
  const segment = useSelectedLayoutSegment();

  const navItems = [
    {
      name: "General",
      href: `/sites/${id}/settings`,
      segment: null
    },
    {
      name: "Custom Properties",
      href: `/sites/${id}/settings/custom-properties`,
      segment: "custom-properties"
    },
    {
      name: "Funnels",
      href: `/sites/${id}/settings/funnels`,
      segment: "funnels"
    }
  ];

  return (
    <div className="flex space-x-2 border-b border-muted-200 pb-4 pt-2">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          // Change style depending on whether the link is active
          className={cn(
            "px-2 py-1.5 rounded-lg text-sm font-medium transition-colors active:bg-accent",
            segment === item.segment
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}