"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Check, Star } from "lucide-react"
import { PaymentModal } from "../modal/payment"
import { EnhancedSubscriptionCard } from "./enhanced-subscription-card"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    description: "Perfect for small websites",
    price: 0,
    period: "forever",
    events: "10K",
    features: [
      "10,000 events per month",
      "1 website",
      "Basic analytics dashboard",
      "Cookie-free tracking",
      "GDPR compliant",
      "Email support"
    ],
    cta: "Get Started Free",
    popular: false,
    buttonVariant: "outline" as const
  },
  {
    name: "Pro",
    description: "Perfect for growing businesses",
    price: "Custom",
    period: "per month",
    events: "100K+",
    features: [
      "100K events included",
      "Additional events: $10/100K",
      "Unlimited websites",
      "Real-time analytics",
      "Advanced reporting",
      "Custom events tracking",
      "API access",
      "Priority support"
    ],
    cta: "Choose Your Usage",
    popular: true,
    buttonVariant: "default" as const,
    isCustom: true
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: "Contact",
    period: "custom pricing",
    events: "Unlimited",
    features: [
      "Unlimited events",
      "Unlimited websites",
      "Custom analytics dashboard",
      "White-label solution",
      "Dedicated support manager",
      "SLA guarantee",
      "Custom integrations",
      "On-premise deployment option"
    ],
    cta: "Contact Sales",
    popular: false,
    buttonVariant: "secondary" as const
  }
]

export function PricingSection() {
  return (
    <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {plans.map((plan, index) => {
        if (plan.isCustom) {
          return (
            <div key={plan.name} className="lg:col-span-1 relative">
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              <EnhancedSubscriptionCard />
            </div>
          )
        }

        return (
          <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </div>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold">
                  {typeof plan.price === 'number' ? '$' : ''}{plan.price}
                </div>
                <div className="text-sm text-muted-foreground">{plan.period}</div>
              </div>
              <div className="text-lg font-semibold text-primary">
                {plan.events} events/month
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            
            <CardFooter>
              {plan.name === 'Starter' ? (
                <Link className={buttonVariants({variant: plan.buttonVariant, className: "w-full"})} href="/signup">
                  {plan.cta}
                </Link>
              ) : plan.name === 'Enterprise' ? (
                <Link className={buttonVariants({variant: plan.buttonVariant, className: "w-full"})} href="mailto:sales@cookieless.com?subject=Enterprise Plan Inquiry">
                  {plan.cta}
                </Link>
              ) : (
                <PaymentModal 
                  buttonVariant={plan.buttonVariant} 
                  buttonClassName="w-full" 
                  mode="subscribe"
                  successUrl={typeof window !== 'undefined' ? window.origin + "/sites" : "/sites"} 
                />
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
