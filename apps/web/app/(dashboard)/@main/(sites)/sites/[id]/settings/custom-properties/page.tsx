import { auth } from "@repo/database";
import { getSiteWrapper, listCustomPropertiesWrapper } from "@/lib/actions";
import CustomPropertiesSettings from "@/components/sites/custom-properties-list";
import { headers } from "next/headers";

export default async function SettingsPage(
    props: {
        params: Promise<{ id: string }>;
    }
) {
    const params = await props.params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return null;
    }
    const site = await getSiteWrapper(params.id);
    if (!site) {
        return null;
    }
    const addedCustomProperties = site.customProperties;
    const databaseCustomProperties = await listCustomPropertiesWrapper({
        siteId: params.id,
        timeData: {
            range: "all time"
        }
    });

    const allCustomProperties = [
        ...databaseCustomProperties,
        // show properties that are added but not in the database
        ...addedCustomProperties.filter(
            (addedProperty) => !databaseCustomProperties.some((databaseProperty) => addedProperty.name === databaseProperty)
        ).map((addedProperty) => addedProperty.name)
    ];

    return (
        <CustomPropertiesSettings allCustomProperties={allCustomProperties} addedCustomProperties={addedCustomProperties} />
    );
}
