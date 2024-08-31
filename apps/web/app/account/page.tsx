import Form from "../../components/form";
import { auth } from "../../auth";
import { editUserWrapper } from "../../lib/actions";
import DeleteUserForm from "../../components/form/delete-user";

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
                            title="Avatar"
                            description="Your profile picture. Accepted formats: .png, .jpg, .jpeg"
                            helpText="Max file size 50MB. Recommended size 400x400."
                            inputAttrs={{
                                name: "avatar",
                                type: "file",
                                defaultValue: session.user.image!
                            }}
                            handleSubmit={editUserWrapper}
                        />
                        <Form
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
                            handleSubmit={editUserWrapper}
                        />
                        <Form
                            title="Email"
                            description="Your email address used to login."
                            helpText="Please enter a valid email."
                            inputAttrs={{
                                name: "email",
                                type: "email",
                                defaultValue: session.user.email!,
                                placeholder: "email@example.com",
                            }}
                            handleSubmit={editUserWrapper}
                        />
                        <Form
                            title="New Password"
                            description="Create a new password"
                            helpText="Please enter a valid password."
                            inputAttrs={{
                                name: "password",
                                type: "password",
                            }}
                            handleSubmit={editUserWrapper}
                        />
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </main>
    );
}
