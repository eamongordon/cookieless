import Form from "@/components/form";
import { auth } from "@/lib/auth";
import { editUserWrapper } from "@/lib/actions";
import DeleteForm from "@/components/form/delete";

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user) {
        return null;
    }
    return (
        <main>
            <div className="flex justify-center items-center">
                <div className="flex w-full max-w-screen-xl flex-col space-y-12 p-8">
                    <div className="flex flex-col space-y-6">
                        <h1 className="text-3xl font-semibold dark:text-white">
                            Settings
                        </h1>
                        <Form
                            type="user"
                            title="Name"
                            description="Your name."
                            helpText="Please use 32 characters maximum."
                            inputAttrs={{
                                name: "name",
                                type: "text",
                                defaultValue: session.user.name!,
                                placeholder: "John Doe",
                                maxLength: 32,
                            }}
                        />
                        <Form
                            type="user"
                            title="Email"
                            description="Your email address used to login."
                            helpText="Please enter a valid email."
                            inputAttrs={{
                                name: "email",
                                type: "email",
                                defaultValue: session.user.email!,
                                placeholder: "email@example.com",
                            }}
                        />
                        <Form
                            type="user"
                            title="New Password"
                            description="Create a new password"
                            helpText="Please enter a valid password."
                            inputAttrs={{
                                name: "password",
                                type: "password",
                                defaultValue: "",
                            }}
                        />
                        <DeleteForm type="user" />
                    </div>
                </div>
            </div>
        </main>
    );
}
