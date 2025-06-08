import BillingOverview from "@/components/billing/overview";
import { auth } from "@/lib/auth";
import { fetchInvoicesForCustomer } from "@/lib/stripe/fetchers";
import { headers } from "next/headers";
import Image from "next/image";
import { PaymentModal } from "@/components/modal/payment";

export default async function BillingSettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user.subscriptionStatus) {
        return (
            <div className="flex-1 flex flex-col gap-8 justify-center items-center">
                <Image
                    src="/cookielogo.svg"
                    alt="Cookie Logo"
                    width={50}
                    height={50}
                />
                <div className="flex flex-col gap-4 text-center">
                    <h1 className="leading-none text-xl md:text-2xl font-semibold">You&apos;re Not Subscribed</h1>
                    <p className="leading-none text-gray-600">Subscribe and get 100,000 events/pageviews per month free.</p>
                </div>
                <PaymentModal />
            </div>
        )
    }
    const invoices = await fetchInvoicesForCustomer();
    return (
        <>
            <BillingOverview />
            <div className="mt-8">
                <h2 className="text-lg font-semibold mb-2">Recent Invoices</h2>
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th className="text-left">Invoice ID</th>
                            <th className="text-left">Amount</th>
                            <th className="text-left">Status</th>
                            <th className="text-left">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((inv: any) => (
                            <tr key={inv.id}>
                                <td className="font-mono">{inv.id}</td>
                                <td>${(inv.amount_due / 100).toFixed(2)}</td>
                                <td>{inv.status}</td>
                                <td>{inv.created ? new Date(inv.created * 1000).toLocaleDateString() : "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}