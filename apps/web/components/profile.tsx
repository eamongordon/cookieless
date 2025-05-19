import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "./logout-button";
import { headers } from "next/headers";

export default async function Profile() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex w-full items-center justify-between">
      <Link
        href="/settings"
        className="flex w-full flex-1 items-center space-x-3 rounded-lg px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-stone-200 active:bg-stone-300 dark:text-white dark:hover:bg-stone-700 dark:active:bg-stone-800"
      >
        <Image
          src={
            session.user.image ??
            `data:image/png;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAwADIDASIAAhEBAxEB/8QAHAAAAQQDAQAAAAAAAAAAAAAABwABBAYDBQgC/8QAJBAAAQMFAAIBBQAAAAAAAAAAAQACAwQFBhESITGhFCJRcZH/xAAYAQADAQEAAAAAAAAAAAAAAAABAwQCAP/EAB4RAAMBAQABBQAAAAAAAAAAAAABAgMRBBITFCEx/9oADAMBAAIRAxEAPwDlRZoYHSnQCemhdK8ABXvFsedUvbtiDfApdKeLXLzvkqLPTOi9hHd2HtFNvjzr8Kj5DjT43O5Yf4t5r1o6lwHKZbOttz4CdgrWuGjpBrjAMkkkgcXDF7aKiVuxtHDELMyKNhLUH8NqmRyM6IRzxu4ROgaAR6Uu1NFOSTLIaaMxc8hV+72GOoY48Bb9s7SPBCczs1okJMeRU/Q55pgQyvGOA8tZ8IW3S3Pp5XbC6hv8cEsLt6QWzGlia95aAqM9XX6T6ZpA04KSmuYOj+0k8SZLZWup3ggogY/lBhDQX/KFgJHpZ4al8Z8ErNQqDNNHQdFljXMG3r3U5U1rdh6BUF5ljGuinlvcrxropHx0N95hQuuX7aQH/KoV7vX1Jd93tV2atkkPlxUZzi72U6c1IurbJBm8nykoqSYYP//Z`
          }
          width={40}
          height={40}
          alt={session.user.name ?? "User avatar"}
          className="h-6 w-6 rounded-full"
        />
        <span className="truncate text-sm font-medium">
          {session.user.name}
        </span>
      </Link>
      <LogoutButton />
    </div>
  );
}
