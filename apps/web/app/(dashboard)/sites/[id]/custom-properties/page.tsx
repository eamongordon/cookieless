import { auth } from "@/lib/auth";
import { getSiteWrapper, listCustomFieldsWrapper } from "@/lib/actions";

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
    const allCustomProperties = await listCustomFieldsWrapper({
        siteId: params.id,
        timeData: {
            range: "all time"
        }
    })
    return (
        <main>
            <div className="flex justify-center items-center">
                <div className="flex w-full max-w-screen-xl flex-col space-y-12 p-8">
                    <div className="flex flex-col space-y-6">
                        <h1 className="text-3xl font-semibold dark:text-white">
                            Custom Properties
                        </h1>
                        {
                            allCustomProperties.map((property) => {
                                const addedCustomProperty = addedCustomProperties.find((obj) => obj.name === property);
                                return (
                                    <div key={property}>
                                        <h2>{property}</h2>
                                        <p>Is Added: {addedCustomProperty ? "Yes" : "No"}</p>
                                        <p>Aggregation Type: {addedCustomProperty?.operation}</p>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        </main>
    );
}
