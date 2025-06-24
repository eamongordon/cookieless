import Form from "@/components/form";
import { getSite } from "@repo/database";
import { auth } from "@repo/database";
import DeleteForm from "@/components/form/delete";
import { headers } from "next/headers";

export default async function SiteSettingsIndex(
    props: {
        params: Promise<{ id: string }>;
    }
) {
    const params = await props.params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        return null;
    }
    const data = await getSite(session.user.id, params.id);

    return (
        <div className="flex flex-col space-y-6">
            <Form
                type="site"
                title="Name"
                description="Give your site a name—it will only be visible to you and your team members."
                helpText="Please use 32 characters maximum."
                inputAttrs={{
                    name: "name",
                    type: "text",
                    defaultValue: data?.name!,
                    placeholder: "My Awesome Site",
                    maxLength: 32,
                    required: true
                }}
            />

            <DeleteForm type="site" siteName={data?.name!} />
        </div>
    );
}
