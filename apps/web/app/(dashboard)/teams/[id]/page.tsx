import { getTeamWrapper } from "@/lib/actions";

export default async function SitePage({
    params,
}: {
    params: { id: string };
}) {
    const team = await getTeamWrapper(params.id);
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-semibold dark:text-white">
                {team.teamName}
            </h1>
        </div>
    );
}