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
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink asChild>
                                    <Link href="/sites">
                                        Personal Account
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Settings
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-8 pt-0">
                <div className="max-w-screen-x flex flex-col space-y-6">
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
                    <BillingForm/>
                </div>
            </main>
        </>
    );
}
