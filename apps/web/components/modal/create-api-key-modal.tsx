"use client";

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Label } from "../ui/label";
import { createTeamApiKeyWrapper, createUserApiKeyWrapper } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Plus } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

export function CreateApiKeyModal({ teamId, variant = "default" }: { teamId?: string, variant?: "default" | "outline" }) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={variant}>
            <Plus />
            Create API Key
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Give your new API key a name. It will be displayed on your dashboard.
            </DialogDescription>
          </DialogHeader>
          <CreateApiKeyForm setOpen={setOpen} teamId={teamId} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant={variant}
        >
          <Plus />
          Create API Key
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Create API Key</DrawerTitle>
          <DrawerDescription>
            Give your new API key a name. It will be displayed on your dashboard.
          </DrawerDescription>
        </DrawerHeader>
        <CreateApiKeyForm className="px-4" setOpen={setOpen} teamId={teamId} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function CreateApiKeyForm({ className, teamId, setOpen }: React.ComponentProps<"form"> & { teamId?: string, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const router = useRouter();
  const [data, setData] = useState({
    name: ""
  });

  return (
    <form
      action={async (data: FormData) => {
        const name = data.get("name") as string;
        try {
          if (teamId) {
            await createTeamApiKeyWrapper(teamId, name);
          } else {
            await createUserApiKeyWrapper(name);
          }
          router.refresh();
          setOpen(false);
          toast.success("API key created successfully!");
        } catch (error) {
          toast.error("Failed to create API key");
        }
      }}
      className={cn("grid items-start gap-4", className)}
    >
      <div className="grid gap-2">
        <Label htmlFor="name">Key Name</Label>
        <Input
          name="name"
          type="text"
          placeholder="My API Key"
          autoFocus
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          maxLength={32}
          required
          id="name"
        />
      </div>
      <CreateApiKeyFormButton />
    </form >
  );
}

function CreateApiKeyFormButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      className="flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-hidden"
      isLoading={pending}
    >
      <p>Create API Key</p>
    </Button>
  );
}