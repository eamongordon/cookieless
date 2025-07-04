import { getSiteWrapper } from "@/lib/actions";
import SetupInstructions from "@/components/sites/setup-instructions";

export default async function SiteSetupPage(
    props: {
        params: Promise<{ id: string }>;
    }
) {
    const params = await props.params;
    const site = await getSiteWrapper(params.id);

    return (
        <div className="flex flex-col space-y-6">
            <SetupInstructions site={site} />
        </div>
    );
}
