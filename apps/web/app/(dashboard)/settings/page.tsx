import Form from "@/components/form";
import { auth } from "@/lib/auth";
import DeleteForm from "@/components/form/delete";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { headers } from "next/headers";
import BillingForm from "@/components/payment-form";

export default async function SettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return null;
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
                    required: true
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
                    required: true
                }}
            />
            <DeleteForm type="user" />
            <BillingForm />
        </>
    );
}
