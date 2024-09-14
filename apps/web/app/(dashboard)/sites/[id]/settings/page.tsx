import Form from "@/components/form";
import { getSite } from "@repo/database";
import { auth } from "@/lib/auth";
import DeleteForm from "@/components/form/delete";

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
        <div className="flex justify-center items-center">
            <div className="flex w-full max-w-screen-xl flex-col space-y-12 p-8">
                <div className="flex flex-col space-y-6">
                    <h1 className="text-3xl font-semibold dark:text-white">
                        Settings
                    </h1>
                    <Form
                        type="site"
                        title="Name"
                        description="The name of your site. This will be used as the meta title on Google as well."
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
            </div>
        </div>
    );
}
