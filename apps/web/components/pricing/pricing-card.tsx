"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Check, Star, Calculator, Building2 } from "lucide-react"
import { useState } from "react"
import { PaymentModal } from "../modal/payment"
import Link from "next/link"

type PricingCardVariant = "pro" | "enterprise"

interface PricingCardProps {
  variant: PricingCardVariant
  isPopular?: boolean
}

interface BaseCardData {
  title: string
  description: string
  icon: any
  featuresTitle: string
  features: Array<{
    name: string
    description: string
  }>
  valueProposition: {
    text: string
    bgColor: string
    borderColor: string
    textColor: string
    icon: string
  }
}

interface ProCardData extends BaseCardData {
  basePrice: number
  includedEvents: number
}

interface EnterpriseCardData extends BaseCardData {}

const cardData: {
  pro: ProCardData
  enterprise: EnterpriseCardData
} = {
  pro: {
    title: "Pro Plan",
    description: "Perfect for growing businesses",
    icon: Calculator,
    basePrice: 10,
    includedEvents: 100000,
    featuresTitle: "✨ Everything included:",
    features: [
      {
        name: "100K Events Included",
        description: "First 100,000 events included in base subscription"
      },
      {
        name: "Real-time Analytics",
        description: "Track your website performance live"
      },
      {
        name: "Unlimited Sites",
        description: "Connect as many websites as you need"
      },
      {
        name: "Cookie-free Tracking",
        description: "GDPR compliant without cookie banners"
      },
      {
        name: "API Access",
        description: "Full API access for custom integrations"
      }
    ],
    valueProposition: {
      text: "Most customers save 40% compared to Google Analytics 4 with our transparent pricing model.",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-200 dark:border-green-800/50",
      textColor: "text-green-800 dark:text-green-200",
      icon: "💡"
    }
  },
  enterprise: {
    title: "Enterprise",
    description: "For large organizations",
    icon: Building2,
    featuresTitle: "🏢 Enterprise features:",
    features: [
      {
        name: "Unlimited Events",
        description: "No limits on tracking volume"
      },
      {
        name: "Unlimited Websites", 
        description: "Connect as many sites as you need"
      },
      {
        name: "Custom Analytics Dashboard",
        description: "Tailored reporting for your business"
      },
      {
        name: "White-label Solution",
        description: "Brand the analytics as your own"
      },
      {
        name: "Dedicated Support Manager",
        description: "Personal support contact"
      },
      {
        name: "SLA Guarantee",
        description: "99.9% uptime commitment"
      },
      {
        name: "Custom Integrations",
        description: "Bespoke API integrations"
      },
      {
        name: "On-premise Deployment",
        description: "Deploy within your infrastructure"
      }
    ],
    valueProposition: {
      text: "Scales to billions of events with enterprise-grade security and compliance.",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800/50",
      textColor: "text-blue-800 dark:text-blue-200",
      icon: "🏢"
    }
  }
}

export function PricingCard({ variant, isPopular = false }: PricingCardProps) {
  const [events, setEvents] = useState([100000]) // Default to 100k events for Pro
  const data = cardData[variant]
  const proData = variant === "pro" ? data as ProCardData : null
  const Icon = data.icon

  // Pro plan pricing calculation
  const eventsCount = events[0] || 0
  const additionalEvents = variant === "pro" && proData ? Math.max(0, eventsCount - proData.includedEvents) : 0
  const usagePrice = variant === "pro" ? Math.ceil(additionalEvents / 100000) * 10 : 0
  const totalPrice = variant === "pro" && proData ? proData.basePrice + usagePrice : null

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`
    }
    return num.toString()
  }

  const cardClassName = variant === "pro" 
    ? "w-full relative border-primary shadow-lg"
    : "w-full relative border-border shadow-lg"

  return (
    <Card className={cardClassName}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-center bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium shadow-lg">
            <Star className="w-4 h-4 mr-1 fill-current" />
            Most Popular
          </div>
        </div>
      )}
      
      <CardHeader className="text-center pt-8">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <Icon className="w-6 h-6" />
          {data.title}
        </CardTitle>
        <CardDescription>{data.description}</CardDescription>
        <div className="mt-4">
          <div className="text-4xl font-bold">
            {variant === "pro" ? `$${totalPrice}` : "Custom"}
          </div>
          <div className="text-sm text-muted-foreground">
            {variant === "pro" ? "per month" : "pricing"}
          </div>
        </div>
        <div className="text-lg font-semibold text-primary">
          {variant === "pro" ? `${formatNumber(eventsCount)} events/month` : "Unlimited events"}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Interactive Events Slider - Pro only */}
        {variant === "pro" && (
          <div className="space-y-4 p-4 bg-gradient-to-r from-primary/10 to-orange/10 rounded-lg border">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Monthly Events
              </label>
              <span className="text-sm font-semibold bg-primary/10 px-2 py-1 rounded">
                {formatNumber(eventsCount)} events
              </span>
            </div>
            <Slider
              value={events}
              onValueChange={setEvents}
              min={100000}
              max={5000000}
              step={100000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>100K</span>
              <span>2.5M</span>
              <span>5M</span>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              Drag to see how pricing scales with your usage
            </div>
          </div>
        )}

        {/* Pricing Breakdown - Pro only */}
        {variant === "pro" && (
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <div className="text-sm font-medium mb-2 flex items-center gap-2">
              💰 Pricing Breakdown
            </div>
            <div className="flex justify-between text-sm">
              <span>Base subscription (includes 100K events)</span>
              <span className="font-medium">${proData?.basePrice}</span>
            </div>
            {additionalEvents > 0 && (
              <div className="flex justify-between text-sm">
                <span>Additional usage ({formatNumber(additionalEvents)} events)</span>
                <span className="font-medium">${usagePrice}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total per month</span>
              <span className="text-primary">${totalPrice}</span>
            </div>
          </div>
        )}
        
        {/* Features Section */}
        <div className="space-y-3">
          <div className="text-sm font-medium mb-3">{data.featuresTitle}</div>
          
          <div className="grid gap-3">
            {data.features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium">{feature.name}</span>
                  <div className="text-xs text-muted-foreground">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Value Proposition */}
        <div className={`p-3 ${data.valueProposition.bgColor} border ${data.valueProposition.borderColor} rounded-lg`}>
          <div className={`text-sm ${data.valueProposition.textColor}`}>
            <span className="font-medium">{data.valueProposition.icon} {variant === "pro" ? "Pro tip:" : "Enterprise ready:"}</span> {data.valueProposition.text}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-6">
        {variant === "pro" ? (
          <PaymentModal 
            buttonVariant="default" 
            buttonClassName="w-full" 
            successUrl={typeof window !== 'undefined' ? window.origin + "/sites" : "/sites"} 
          />
        ) : (
          <Link href="mailto:sales@cookieless.com?subject=Enterprise Plan Inquiry" className={buttonVariants({ variant: "secondary", className: "w-full" })}>
            Contact Sales
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
