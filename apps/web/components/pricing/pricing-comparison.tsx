"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Check, X, Zap, Shield, BarChart3 } from "lucide-react"
import Link from "next/link"

const features = [
  {
    category: "Analytics Features",
    icon: BarChart3,
    items: [
      { name: "Page views & visitors", pro: true, enterprise: true },
      { name: "Real-time analytics", pro: true, enterprise: true },
      { name: "Custom events tracking", pro: true, enterprise: true },
      { name: "Conversion funnels", pro: true, enterprise: true },
      { name: "Advanced reporting", pro: true, enterprise: true },
      { name: "Data export (CSV/JSON)", pro: true, enterprise: true },
      { name: "Custom dashboards", pro: false, enterprise: true },
      { name: "White-label reporting", pro: false, enterprise: true },
    ]
  },
  {
    category: "Privacy & Compliance",
    icon: Shield,
    items: [
      { name: "Cookie-free tracking", pro: true, enterprise: true },
      { name: "GDPR compliant", pro: true, enterprise: true },
      { name: "No personal data collection", pro: true, enterprise: true },
      { name: "Data retention controls", pro: true, enterprise: true },
      { name: "Data processing agreement", pro: false, enterprise: true },
      { name: "On-premise deployment", pro: false, enterprise: true },
    ]
  },
  {
    category: "Integration & API",
    icon: Zap,
    items: [
      { name: "JavaScript tracking", pro: true, enterprise: true },
      { name: "REST API access", pro: true, enterprise: true },
      { name: "Webhooks", pro: true, enterprise: true },
      { name: "Custom integrations", pro: false, enterprise: true },
      { name: "White-label solution", pro: false, enterprise: true },
      { name: "Dedicated support manager", pro: false, enterprise: true },
    ]
  }
]

const plans = [
  { name: "Pro", price: "From $10/mo" },
  { name: "Enterprise", price: "Custom" }
]

export function PricingComparison() {
  return (
    <div className="mt-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Compare Plans</h2>
        <p className="text-lg text-muted-foreground">
          See exactly what's included in each plan
        </p>
      </div>
      
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="grid grid-cols-3 gap-4">
            <div></div>
            {plans.map((plan) => (
              <div key={plan.name} className="text-center">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground font-medium">{plan.price}</p>
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {features.map((category, categoryIndex) => (
            <div key={category.category} className={categoryIndex > 0 ? "border-t" : ""}>
              <div className="bg-muted/20 px-6 py-3">
                <div className="flex items-center gap-2 font-semibold">
                  <category.icon className="w-5 h-5" />
                  {category.category}
                </div>
              </div>
              
              {category.items.map((feature, featureIndex) => (
                <div key={feature.name} className={`grid grid-cols-3 gap-4 px-6 py-3 ${featureIndex % 2 === 0 ? 'bg-muted/10' : ''}`}>
                  <div className="font-medium text-sm">{feature.name}</div>
                  <div className="text-center">
                    {feature.pro ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    )}
                  </div>
                  <div className="text-center">
                    {feature.enterprise ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="text-center">
          <Link href="#pro-plan" className={buttonVariants({ variant: "default", className: "w-full" })}>
            Choose Pro Plan
          </Link>
        </div>
        <div className="text-center">
          <Link href="mailto:sales@cookieless.com?subject=Enterprise Plan Inquiry" className={buttonVariants({ variant: "secondary", className: "w-full" })}>
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  )
}
