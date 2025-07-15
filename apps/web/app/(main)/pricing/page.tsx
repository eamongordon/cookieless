import { Metadata } from "next"
import { PricingSection } from "@/components/pricing/pricing-section"

export const metadata: Metadata = {
  title: "Pricing - Cookieless Analytics",
  description: "Choose the perfect plan for your analytics needs. Cookie-free tracking with transparent pricing.",
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Get powerful cookie-free analytics without the complexity. 
            Choose a plan that scales with your business.
          </p>
          <div className="inline-flex items-center rounded-full border bg-background px-4 py-2 text-sm">
            <span className="mr-2">🚀</span>
            <span>All plans include unlimited sites and real-time analytics</span>
          </div>
        </div>
        
        <PricingSection />
        
        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid gap-6 max-w-3xl mx-auto">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">What counts as an event?</h3>
              <p className="text-muted-foreground">
                An event is any user interaction we track, such as page views, clicks, form submissions, 
                or custom events you define. Each unique interaction counts as one event.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Is the tracking really cookie-free?</h3>
              <p className="text-muted-foreground">
                Yes! Our analytics solution doesn't use cookies or persistent storage, making it 
                fully GDPR compliant without requiring consent banners.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Can I change plans at any time?</h3>
              <p className="text-muted-foreground">
                Absolutely. You can upgrade or downgrade your plan at any time. Changes will be 
                reflected in your next billing cycle.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">What happens if I exceed my event limit?</h3>
              <p className="text-muted-foreground">
                You'll be automatically charged for additional events at $10 per 100K events. 
                We'll notify you before any overage charges are applied.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
