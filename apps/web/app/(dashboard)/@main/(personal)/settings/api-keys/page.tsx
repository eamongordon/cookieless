import { ApiKeyList } from "@/components/api-keys/api-key-list";
import { auth } from "@/lib/auth";
import { getUserApiKeys } from "@repo/database";
import { headers } from "next/headers";

export default async function ApiKeysSettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return null;
    }

    const apiKeys = await getUserApiKeys(session.user.id);

    return (
        <ApiKeyList
            apiKeys={apiKeys}
            isTeam={false}
        />
    );
}
