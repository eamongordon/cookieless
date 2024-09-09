import Form from "@/components/form";
import { getSite } from "@repo/database";
import { updateSiteWrapper } from "@/lib/actions";
import DeleteSiteForm from "@/components/form/delete-site";
import { auth } from "@/lib/auth";

export default async function SiteSettingsIndex({
    params,
}: {
    params: { id: string };
}) {

    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }
    const data = await getSite(session.user.id, params.id);

    return (
        <div className="flex flex-col space-y-6">
            <Form
                title="Name"
                description="The name of your site. This will be used as the meta title on Google as well."
                helpText="Please use 32 characters maximum."
                inputAttrs={{
                    name: "name",
                    type: "text",
                    defaultValue: data?.siteName!,
                    placeholder: "My Awesome Site",
                    maxLength: 32,
                }}
                handleSubmit={updateSiteWrapper}
            />

            <DeleteSiteForm siteName={data?.siteName!} />
        </div>
    );
}
