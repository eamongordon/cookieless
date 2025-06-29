import { ApiKeyList } from "@/components/api-keys/api-key-list";
import { notFound } from "next/navigation";
import { getTeam, getTeamApiKeys } from "@repo/database";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type Params = Promise<{ id: string }>;

export default async function TeamApiKeysSettingsPage({ params }: { params: Params }) {
    const { id } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return null;
    }

    const team = await getTeam(id, session.user.id);
    if (!team) {
        return notFound();
    }

    const apiKeys = await getTeamApiKeys(id, session.user.id);

    return (
        <ApiKeyList
            apiKeys={apiKeys}
            isTeam={true}
            teamId={id}
        />
    );
}
