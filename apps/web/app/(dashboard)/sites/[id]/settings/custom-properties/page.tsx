import { auth } from "@/lib/auth";
import { getSiteWrapper, listCustomPropertiesWrapper } from "@/lib/actions";
import CustomPropertiesSettings from "@/components/sites/custom-properties-list";

export default async function SettingsPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await auth();
    if (!session?.user) {
        return null;
    }
    const site = await getSiteWrapper(params.id);
    if (!site) {
        return null;
    }
    const addedCustomProperties = site.customProperties;
    const allCustomProperties = await listCustomPropertiesWrapper({
        siteId: params.id,
        timeData: {
            range: "all time"
        }
    })
    return (
        <CustomPropertiesSettings allCustomProperties={allCustomProperties} addedCustomProperties={addedCustomProperties} />
    );
}
