import { AppSidebar } from "@/components/app-sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Layout() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return null;
    }
    return <AppSidebar />;
}