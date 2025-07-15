"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Check, Star, Calculator } from "lucide-react"
import { useState } from "react"
import { PaymentModal } from "../modal/payment"

export function EnhancedSubscriptionCard() {
    const [events, setEvents] = useState([500000]) // Default to 500k events
    
    // Calculate pricing based on events
    const basePrice = 10
    const eventsCount = events[0] || 0
    const includedEvents = 100000 // First 100K events included in base fee
    const additionalEvents = Math.max(0, eventsCount - includedEvents)
    const usagePrice = Math.ceil(additionalEvents / 100000) * 10
    const totalPrice = basePrice + usagePrice
    
    // Format numbers for display
    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(0)}K`
        }
        return num.toString()
    }

    return (
        <Card className="w-full relative border-primary shadow-lg">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                </div>
            </div>
            
            <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <Calculator className="w-6 h-6" />
                    Pro Plan
                </CardTitle>
                <CardDescription>Perfect for growing businesses</CardDescription>
                <div className="mt-4">
                    <div className="text-4xl font-bold">${totalPrice}</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
                {/* Interactive Events Slider */}
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
                
                {/* Pricing Breakdown */}
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        💰 Pricing Breakdown
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Base subscription (includes 100K events)</span>
                        <span className="font-medium">${basePrice}</span>
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
                
                {/* Features Section */}
                <div className="space-y-3">
                    <div className="text-sm font-medium mb-3">✨ Everything included:</div>
                    
                    <div className="grid gap-3">
                        <div className="flex items-start space-x-3">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <span className="font-medium">100K Events Included</span>
                                <div className="text-xs text-muted-foreground">First 100,000 events included in base subscription</div>
                            </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <span className="font-medium">Real-time Analytics</span>
                                <div className="text-xs text-muted-foreground">Track your website performance live</div>
                            </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <span className="font-medium">Unlimited Sites</span>
                                <div className="text-xs text-muted-foreground">Connect as many websites as you need</div>
                            </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <span className="font-medium">Cookie-free Tracking</span>
                                <div className="text-xs text-muted-foreground">GDPR compliant without cookie banners</div>
                            </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <span className="font-medium">API Access</span>
                                <div className="text-xs text-muted-foreground">Full API access for custom integrations</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Value Proposition */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm text-green-800">
                        <span className="font-medium">💡 Pro tip:</span> Most customers save 40% compared to Google Analytics 4 with our transparent pricing model.
                    </div>
                </div>
            </CardContent>
            
            <CardFooter className="pt-6">
                <PaymentModal 
                    buttonVariant="default" 
                    buttonClassName="w-full text-lg py-6" 
                    successUrl={typeof window !== 'undefined' ? window.origin + "/sites" : "/sites"} 
                />
            </CardFooter>
        </Card>
    )
}
