"use client";

import { CreateSiteModal } from "../modal/create-site";
import { useModal } from "../modal/provider";
import { Button } from "../ui/button";

export function CreateSiteButton() {
    const modal = useModal();
    return (
      <Button
        onClick={() => modal?.show(<CreateSiteModal />)}
      >
        Create New Site
      </Button>
    );
  }