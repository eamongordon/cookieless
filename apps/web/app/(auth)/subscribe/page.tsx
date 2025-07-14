import { SubscriptionCard } from "@/components/onboarding/subscription-card"

export default function SubscribePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 pt-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Almost there!</h1>
                    <p className="text-muted-foreground">Choose your plan to get started with Cookieless.</p>
                </div>
                
                <SubscriptionCard />
                
                <div className="text-center mt-6">
                    <p className="text-xs text-muted-foreground">
                        Cancel anytime • No setup fees
                    </p>
                </div>
            </div>
        </div>
    );
}