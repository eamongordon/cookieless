"use client";

import { useModal } from "@/components/modal/provider";
import CreateSiteModal from "../modal/create-site";
import { Button } from "../ui/button";

export default function CreateSiteButton() {
  const modal = useModal();
  return (
    <Button
      onClick={() => modal?.show(<CreateSiteModal/>)}
      className="rounded-lg border border-black bg-black px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
    >
      Create New Site
    </Button>
  );
}