import Form from "@/components/form";
import DeleteForm from "@/components/form/delete";
import { getTeamWrapper } from "@/lib/actions";
import { notFound } from "next/navigation";

type Params = Promise<{ id: string }>;

export default async function SettingsPage({ params }: { params: Params }) {
    const { id } = await params;
    const team = await getTeamWrapper(id);
    if (!team) {
        return notFound();
    }
    return (
        <>
            <Form
                type="user"
                title="Name"
                description="Your name."
                helpText="Please use 32 characters maximum."
                inputAttrs={{
                    name: "name",
                    type: "text",
                    defaultValue: team.name,
                    placeholder: "My Awesome Team",
                    maxLength: 32,
                }}
            />
            <DeleteForm type="user" />
        </>
    );
}
